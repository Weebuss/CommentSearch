import * as vscode from 'vscode';

/** Тип маркера. */
type MarkerType = 'TODO' | 'BUG'

/** Найденный маркер с индексом строки с нуля и описанием. */
interface Marker {
	type: MarkerType;
	line: number;
	description: string;
}

/**
 * Находит первый TODO или BUG в каждой строке документа.
 * @param document Документ для поиска.
 * @returns Массив найденных маркеров.
 */
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

/**
 * Регистрирует команду поиска и перехода к выбранному маркеру.
 * @param context Контекст расширения для хранения регистрации команды.
 */
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

/** Завершение работы; регистрацию команды освобождает VS Code. */
export function deactivate() {}
