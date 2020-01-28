/**
 * Loads some marks into a given ISCO marks column.
 * How to use : Read description in HTML
 */

'use strict';

const SPACE = ' ';
const COMMA = ',';
const CHECKED = 'checked';
// Settings
const ILM_OPT = {
	marks_col_label : 'Quiz1', // Label of the table column where marks should be loaded
	mark_sep : SPACE, // Space as default sep (Excel copy column)
	marks_list : '1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0', // marks list, space or coma separated
	marks : [], // Final array of marks exploded from marks_list
};


const LOAD_MARKS_MARKUP = `
<div id="ilm_container">
	<div>
		<h3>Loads marks into a given ISCO column</h3>
    	<p>The script DOES NOT SUBMIT !
    		<br/>Enter following data before clicking the "Load marks" button :
		</p>
		<ul>
			<li><strong>First line</strong> (or part) of the TH label of target column</li>
			<li>Which character separates the marks in the provided list</li>
			<li>List of marks. It must have the same count of numbers than the table rows count (students count).</li>
		</ul>
	</div>
	<div class="ilm_form">
		<label for="marks_col_label">Marks column label:</label>
		<input type="text" id="marks_col_label" placeholder="Enter marks column label here" value="${ILM_OPT.marks_col_label}"/>
		<br/>
		<label for="mark_sep_space">Marks separator:</label>
		<label for="mark_sep_space">Space</label>
		<input type="radio" class="mark_sep" name="mark_sep" id="mark_sep_space" value="${SPACE}" ${ILM_OPT.mark_sep===SPACE?CHECKED:''}/>
		<label for="mark_sep_coma">Coma</label>
		<input type="radio" class="mark_sep" name="mark_sep" id="ilm_mark_sep_coma" value="${COMMA}" ${ILM_OPT.mark_sep===COMMA?CHECKED:''}/>
		<br/>
		<label for="marks_list">Marks list:</label>
		<textarea id="marks_list" class="marks_list" placeholder="Enter marks here, space or coma separated list" rows="2" value="">${ILM_OPT.marks_list}</textarea>
		<br/>
		<button id="ilm_go_btn" class="ilm_go_btn">Load marks</button>
	</div>
	<p class="ilm_msg"></p>
<div>`

const SESSION_SELECT_ID = 'j_id54:lstSessionGroupeHoraire';
console.clear();

/**
 * Displays a message in HTML block 
 */
function ilm_display(msg) {
	document.querySelector('#ilm_container .ilm_msg').textContent = msg;
}

// Loads HTML and listener
try {
	// Finding top box to inject HTML
	let session_select = document.getElementById(SESSION_SELECT_ID);
	let top_box = session_select.parentNode.parentNode.parentNode;
	//console.log('top_box:', top_box);
	top_box.innerHTML += LOAD_MARKS_MARKUP;
	document.getElementById('ilm_go_btn').addEventListener('click', load_marks);
	
}
catch(error) {
	console.error(error);
	ilm_display(error.message);
}

/**
 * Loads the marks in the right column
 */
function load_marks() {
	try {
		ilm_display('');
		// Getting user marks column label, trimmed
		let input_marks_col_label = document.getElementById('marks_col_label');
		console.assert(null !== input_marks_col_label && 'INPUT'===input_marks_col_label.tagName, `INPUT of marks col label not found.`);
		ILM_OPT.marks_col_label = input_marks_col_label.value.trim();
		console.log(`Searching column with label including : (${ILM_OPT.marks_col_label}).`)
		// Looking for the <label> element with the matching text
		let all_labels = document.getElementsByTagName('label');
		// Looking for the corresponding label in the table (to obtain the column index)
		let target_label = null; // <label> element to look for
		for (let lab of all_labels) {
			if (lab.textContent.includes(ILM_OPT.marks_col_label)) {
				target_label = lab;
				break;
			}
		}
		console.assert(null !== target_label, `LABEL with text "${ILM_OPT.marks_col_label}" not found in document.`);
	
		// The parent TH
		let th_marks_col = target_label.parentNode.parentNode;
		console.assert(null !== th_marks_col && th_marks_col.tagName === 'TH', 'Parent TH not found.');
		// Getting column index corresponding to the TH 
		let marks_col_index = 1;
		let th_prev_sibl = th_marks_col.previousElementSibling;
		while (null !== th_prev_sibl) {
			marks_col_index++;
			th_prev_sibl = th_prev_sibl.previousElementSibling;
		}
		console.log(`Marks column index found : (${marks_col_index}).`);
	
		// Collecting TDs corresponding to the column index in the main table
		// BEWARE ! Main table contains sub-tables, so important to define sharp CSS path from main table 
		let tds = document.querySelectorAll(`.isi_form_tables>tbody>tr>td:nth-of-type(${marks_col_index})`);
		//console.log(tds);
		// Getting the separator defined by user
		let mark_sep_radio = document.querySelector('.mark_sep:checked');
		if (null===mark_sep_radio) {
			throw new Error(`No marks separator radio checked found.`);
		}
		ILM_OPT.mark_sep = mark_sep_radio.value;
		if (! [SPACE, COMMA].includes(ILM_OPT.mark_sep)) {
			throw new Error(`Invalid mark separator: (${ILM_OPT.mark_sep}).`);
		}
		console.log(`Marks separator used : (${ILM_OPT.mark_sep}).`);
		
		let ta_marks_list = document.getElementById('marks_list');
		console.assert(null !== ta_marks_list, `Textarea of marks list not found.`);
		ILM_OPT.marks_list = ta_marks_list.value;
		ILM_OPT.marks = ILM_OPT.marks_list.split(ILM_OPT.mark_sep);
		if (ILM_OPT.marks.length !== tds.length) {
			throw new Error(`Count mismatch between marks count (${ILM_OPT.marks.length}) and rows count (${tds.length}).`);
		}
		tds.forEach((td,i)=>{
			let input = td.getElementsByTagName('input')[0];
			input.value = ILM_OPT.marks[i].trim();
			//input.style.backgroundColor = '#cddc39';
			input.classList.add('ilm_target_input');
			//console.log(input);
		});
	}
	catch(error) {
		console.error(error);
		ilm_display(error.message);
	}
}
