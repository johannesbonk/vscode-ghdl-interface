// MIT License

// Copyright (c) 2020 Johannes Bonk

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const vscode = require('vscode');
const { exec } = require('child_process');
const lineDecorationType = vscode.window.createTextEditorDecorationType({
	color: 'black',
	overviewRulerColor: 'red',
	overviewRulerLane: vscode.OverviewRulerLane.Right,
	backgroundColor: 'red',
	isWholeLine: 'true', 
	light: {
		border: '2px solid black',
	},
	dark: {
		border: '2px solid white',
	}
  })
const largeDecorationType = vscode.window.createTextEditorDecorationType({
	color: 'black',
	overviewRulerColor: 'red',
	overviewRulerLane: vscode.OverviewRulerLane.Right,
	backgroundColor: 'red',
	light: {
		border: '2px solid black',
	},
	dark: {
		border: '2px solid white',
	}
  })
const smallDecorationType = vscode.window.createTextEditorDecorationType({
	overviewRulerColor: 'red',
	overviewRulerLane: vscode.OverviewRulerLane.Right,
	border: '1px solid red'
  })
const LinkedList = require('./util/linkedlist/LinkedList'); 
const ErrorData = require('./util/linkedlist/ErrorData'); 
  
// this method is called when vs code is activated
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('ghdl-interface now active!'); // log extension start

	let disposableEditorAnalyze = vscode.commands.registerCommand('extension.editor_ghdl-analyze_file', function () {
		const filePathEditor = vscode.window.activeTextEditor.document.uri.fsPath; // get file path of the currently opened file
		analyzeFile(filePathEditor); 
	});
	let disposableExplorerAnalyze = vscode.commands.registerCommand('extension.explorer_ghdl-analyze_file', (element) => {
		const filePathExplorer = element.fsPath;
		analyzeFile(filePathExplorer);  
	});
	context.subscriptions.push(disposableEditorAnalyze);
	context.subscriptions.push(disposableExplorerAnalyze); 
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}

/*
**Function: analyzeFile
**usage: invokes ghdl to analyze file from filePath parameter
**parameter: path of the file to analyze
**return value(s): none
*/
/**
 * @param {string} filePath
 */
function analyzeFile(filePath) {
	let command = 'ghdl -a ' + filePath; //command to execute
	console.log(command);
	exec(command, async (err, stdout, stderr) => {
  		if (err) {
			if(vscode.window.activeTextEditor.document.uri.fsPath != filePath) { // open analyzed file in editor, if ghdl analyze was invoked by explorer, with the file not open, and errors occured
				let doc = await vscode.workspace.openTextDocument(filePath);
				await vscode.window.showTextDocument(doc); // wait till text editor is shown and set as active editor
			}
			showErrors(err); // highlightes the errors in the editor
			vscode.window.showErrorMessage('there were errors in the file to analyze');
			vscode.window.showInformationMessage('watch terminal for further information');
    		return;
  		} else {
			vscode.window.showInformationMessage('file analyzed successfully without errors');
		}
	});
}

/*
**Function: showErrors
**usage: shows the errors reportedby ghdl in the vscode editor 
**parameter: err (the error message)
**return value(s): none
*/
/**
 * @param {import("child_process").ExecException} err
 */
function showErrors(err) {
	let errStr; // the string containing the error message
	let errorList = new LinkedList(); // linked list containing error highlighting data
	
	console.log(err);

	errStr = err.toString(); 
	errStr = errStr.split(/\r?\n/); // splits the error by new line 
	
	setErrorList(errStr, errorList); // sets the linked list containing error information
	decorateErrors(errorList); 
}

/*
**Function: setErrorList
**usage: analyzes the error string and sets the error data in it, according to the error message
**parameter: errStr (string conatining the error message), errorList(the error list)
**return value(s): errorList
*/
/**
 * @param {any[]} errStr
 * @param {import("../../../VSCode_Extensions/ghdl-interface/src/util/linkedlist/LinkedList")} errorList
 */
function setErrorList(errStr, errorList) {
	let errHints = []; // all error hits in the error message
	const regExHints = /[0-9]+[:]{1}[0-9]+[:]{1}[^]*/g; 

	// extracts everything after the file path in every line of the error message
	errStr.forEach(function(errStr) { 
		let match; 
		while(match = regExHints.exec(errStr)) {
			errHints.push(match[0]); 
		}
	});
	
	errHints.forEach(function(errHint){ // loop over all errors found
		const bufPos = errHint.match(/(\d+)/g); // position of error in source code 
		const bufMsg = errHint.match(/\s[^]+/g); // message of specific error
		let bufKeywrds = [];
		
		const keySQM = errHint.match(/'(.*?)'/g); //keywords single quitation marks
		const keyDQM = errHint.match(/"(.*?)"/g); //keywords double quotation marks
		if(keyDQM != null) { // delete double quotation marks of message
			keyDQM.forEach(function(keywrd) {
				bufKeywrds.push(keywrd.replace(/"/g, '')); 
			});
		} 
		if(keySQM != null) {
			keySQM.forEach(function(keywrd) { // delete single quotation marks of message
				bufKeywrds.push(keywrd.replace(/'/g, ''));
			});
		}
		 
		if(bufPos.length === 2) { // append error information at linked list
			let data = new ErrorData(bufPos[0] , bufPos[1], bufMsg[0], bufKeywrds); 
			errorList.append(data); 
		}
	});
	return errorList; 
}

/*
**Function: decorateErrors
**usage: sets the decoration information for vscode, according to the error list and passes them to vscode
**parameter: errorList
**return value(s): none
*/
/**
 * @param {import("../../../VSCode_Extensions/ghdl-interface/src/util/linkedlist/LinkedList")} errorList
 */
function decorateErrors(errorList) {
	let activeEditor = vscode.window.activeTextEditor; // active text editor 

	if (!activeEditor) { // dont do error highlighting if no editor is open 
		return;
	}

	let smallNumbers = []; // contains decoration objects of errors with less than 3 characters
	let largeNumbers = []; // contains decoration objects of errors with more or equal to 3 characters
	let wholeLine = []; // contains decoration objects of errors with no characters (whole line will be highlighted)
	for(let listElement = 0; listElement < errorList.getLength(); listElement++) {
		const currElement = errorList.getElement(listElement); // current errorList element
		const currLine = currElement.getLine() - 1; //subtracted by 1 since vs code is 0 indexed and ghdl starts lines at 1
		const currMessage = currElement.getMessage(); // message of current error
		const keywrdsArr = errorList.getElement(listElement).getKeywords(); //check if errorList has keywords error

		if(keywrdsArr.length === 0) {
			const posWholeLine = new vscode.Position(currLine, 0); // index of line 
			const wholeLineDecoration = { range: new vscode.Range(posWholeLine, posWholeLine), hoverMessage: currMessage};
			wholeLine.push(wholeLineDecoration); // set decoration for whole line
		}
		for(let i = 0; i < keywrdsArr.length; i++) { // iterate over all keywords in array
			const regEx = new RegExp(keywrdsArr[i], 'g'); // regex containing current keyword
			const text = activeEditor.document.getText(); // active text editor
			let match;
			while (match = regEx.exec(text)) { // look for matches of keyword in active window
				const startPos = activeEditor.document.positionAt(match.index); // start position of match 
				const endPos = activeEditor.document.positionAt(match.index + match[0].length); // end position of match 
				if(startPos.line === currLine) { // check if line of keyword and match are equal
					const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: currMessage};
					if (match[0].length < 3) {
						smallNumbers.push(decoration);
					} else {
						largeNumbers.push(decoration);
					}
				}
			}
		}
	}
	// set decorations with specified css style 
	activeEditor.setDecorations(lineDecorationType, wholeLine);
	activeEditor.setDecorations(smallDecorationType, smallNumbers);
	activeEditor.setDecorations(largeDecorationType, largeNumbers);
}
