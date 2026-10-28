// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

type MarkerType = 'TODO' | 'BUG'

interface Marker {
	type: MarkerType;
	line: number;
	description: string;
}

function findMarkers(document: vscode.TextDocument): Marker[] {
	const markers: Marker[] = [];

	const regex = /\b(TODO|BUG)\b\s*:?\s*(.*)/i;

	for (let i=0; i<document.lineCount; i++) {
		const text = document.lineAt(i).text;
		const match = regex.exec(text);

		if (match) {
			markers.push({
				type: match[1].toUpperCase() as MarkerType,
				line: i,
				description: match[2].trim()
			});
		}
	}

	return markers.sort();
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const disposable1 = vscode.commands.registerCommand('commentsearch.Search', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage("Please open a file");
			return;
		}

		const markers = findMarkers(editor.document);
		if (markers.length === 0) {
			vscode.window.showInformationMessage('No markers found');
			return;
		}
		
		const items = markers.map(marker => ({
			label: `${marker.type} line ${marker.line + 1}`,
			description: marker.description,
			marker: marker
		}));

		const selected = await vscode.window.showQuickPick(
			items,
			{ placeHolder: 'Choose Marker'}
		);

		if (!selected) {
			return;
		}

		const position = new vscode.Position(
			selected.marker.line, 0
		);

		editor.selection = new vscode.Selection(
			position, position
		);

		editor.revealRange(
			new vscode.Range(position, position),
			vscode.TextEditorRevealType.InCenter
		)
	})

	context.subscriptions.push(disposable1);
}

// This method is called when your extension is deactivated
export function deactivate() {}