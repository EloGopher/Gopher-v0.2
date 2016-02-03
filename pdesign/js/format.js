var source = the.editor ? the.editor.getValue() : $('#source').val(),
	 output,
	 opts = {};

opts.indent_size = $('#tabsize').val();
opts.indent_char = opts.indent_size == 1 ? '\t' : ' ';
opts.max_preserve_newlines = $('#max-preserve-newlines').val();
opts.preserve_newlines = opts.max_preserve_newlines !== "-1";
opts.keep_array_indentation = $('#keep-array-indentation').prop('checked');
opts.break_chained_methods = $('#break-chained-methods').prop('checked');
opts.indent_scripts = $('#indent-scripts').val();
opts.brace_style = $('#brace-style').val();
opts.space_before_conditional = $('#space-before-conditional').prop('checked');
opts.unescape_strings = $('#unescape-strings').prop('checked');
opts.jslint_happy = $('#jslint-happy').prop('checked');
opts.end_with_newline = $('#end-with-newline').prop('checked');
opts.wrap_line_length = $('#wrap-line-length').val();
opts.indent_inner_html = $('#indent-inner-html').prop('checked');
opts.comma_first = $('#comma-first').prop('checked');
opts.e4x = $('#e4x').prop('checked');

if (looks_like_html(source)) {
	 output = html_beautify(source, opts);
} else {
	 if ($('#detect-packers').prop('checked')) {
		  source = unpacker_filter(source);
	 }
	 output = js_beautify(source, opts);
}
if (the.editor) {
	 the.editor.setValue(output);
} else {
	 $('#source').val(output);
}


function looks_like_html(source) {
	 // <foo> - looks like html
	 // <!--\nalert('foo!');\n--> - doesn't look like html

	 var trimmed = source.replace(/^[ \t\n\r]+/, '');
	 var comment_mark = '<' + '!-' + '-';
	 return (trimmed && (trimmed.substring(0, 1) === '<' && trimmed.substring(0, 4) !== comment_mark));
}
