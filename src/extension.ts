import * as path from 'path';
import { execFile } from 'child_process';
import { workspace, ExtensionContext, tasks, Task, TaskDefinition, ShellExecution, TaskScope, TaskProvider, debug, DebugConfigurationProvider, WorkspaceFolder, DebugConfiguration, CancellationToken, ProviderResult, TextDocument, window } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

interface QuadrateTaskDefinition extends TaskDefinition {
  task: string;
  file?: string;
}

class QuadrateTaskProvider implements TaskProvider {
  async provideTasks(): Promise<Task[]> {
    const buildTask = new Task(
      { type: 'quadrate', task: 'build-debug' } as QuadrateTaskDefinition,
      TaskScope.Workspace,
      'build-debug',
      'quadrate',
      new ShellExecution('quadc -g ${file} -o ${fileBasenameNoExtension}_debug'),
      []
    );
    return [buildTask];
  }

  async resolveTask(task: Task): Promise<Task | undefined> {
    const definition = task.definition as QuadrateTaskDefinition;
    if (definition.task === 'build-debug') {
      return new Task(
        definition,
        TaskScope.Workspace,
        'build-debug',
        'quadrate',
        new ShellExecution('quadc -g ${file} -o ${fileBasenameNoExtension}_debug'),
        []
      );
    }
    return undefined;
  }
}

class QuadrateDebugConfigProvider implements DebugConfigurationProvider {
  provideDebugConfigurations(folder: WorkspaceFolder | undefined, token?: CancellationToken): ProviderResult<DebugConfiguration[]> {
    return [
      {
        name: 'Build & Debug Quadrate',
        type: 'quadrate',
        request: 'launch',
        program: '${workspaceFolder}/${fileBasenameNoExtension}_debug',
        args: [],
        stopAtEntry: false,
        cwd: '${workspaceFolder}',
        preLaunchTask: 'quadrate: build-debug'
      }
    ];
  }

  resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {
    // If this is a quadrate debug config, convert it to cppdbg
    if (config.type === 'quadrate') {
      return {
        ...config,
        type: 'cppdbg',
        environment: config.environment || [],
        externalConsole: config.externalConsole || false,
        MIMode: config.MIMode || 'gdb',
        miDebuggerPath: config.miDebuggerPath || '/usr/bin/gdb',
        setupCommands: config.setupCommands || [
          {
            description: 'Enable pretty-printing for gdb',
            text: '-enable-pretty-printing',
            ignoreFailures: true
          }
        ]
      };
    }
    return config;
  }
}

export function activate(context: ExtensionContext) {
  const config = workspace.getConfiguration('quadrate');
  const serverPath = config.get<string>('lsp.path', 'quadlsp');

  const serverOptions: ServerOptions = {
    command: serverPath,
    args: [],
    transport: TransportKind.stdio
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'quadrate' }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('**/*.qd'),
      configurationSection: 'quadrate'
    },
    initializationOptions: {
      lint: {
        enabled: config.get<boolean>('lint.enabled', true),
        path: config.get<string>('lint.path', 'quadlint')
      }
    }
  };

  client = new LanguageClient(
    'quadrate',
    'Quadrate Language Server',
    serverOptions,
    clientOptions
  );

  // Send configuration changes to the server
  context.subscriptions.push(
    workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('quadrate.lint')) {
        const newConfig = workspace.getConfiguration('quadrate');
        client.sendNotification('workspace/didChangeConfiguration', {
          settings: {
            quadrate: {
              lint: {
                enabled: newConfig.get<boolean>('lint.enabled', true),
                path: newConfig.get<string>('lint.path', 'quadlint')
              }
            }
          }
        });
      }
    })
  );

  client.start();

  // Register task provider
  const taskProvider = tasks.registerTaskProvider('quadrate', new QuadrateTaskProvider());
  context.subscriptions.push(taskProvider);

  // Register debug configuration provider
  const debugProvider = debug.registerDebugConfigurationProvider('quadrate', new QuadrateDebugConfigProvider());
  context.subscriptions.push(debugProvider);

  // Run quadfmt and quaduses on save
  context.subscriptions.push(
    workspace.onDidSaveTextDocument((document: TextDocument) => {
      if (document.languageId !== 'quadrate') {
        return;
      }

      const config = workspace.getConfiguration('quadrate');
      const filePath = document.uri.fsPath;
      const formatEnabled = config.get<boolean>('format.onSave');
      const usesEnabled = config.get<boolean>('uses.onSave');

      const runUses = () => {
        if (usesEnabled) {
          const quadusesPath = config.get<string>('uses.path', 'quaduses');
          execFile(quadusesPath, ['-w', filePath], (error, stdout, stderr) => {
            if (error) {
              window.showErrorMessage(`quaduses failed: ${stderr || error.message}`);
            }
          });
        }
      };

      if (formatEnabled) {
        const quadfmtPath = config.get<string>('format.path', 'quadfmt');
        execFile(quadfmtPath, ['-w', filePath], (error, stdout, stderr) => {
          if (error) {
            window.showErrorMessage(`quadfmt failed: ${stderr || error.message}`);
          }
          runUses();
        });
      } else {
        runUses();
      }
    })
  );
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
