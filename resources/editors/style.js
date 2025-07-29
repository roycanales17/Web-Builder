export function renderStyle(element, render, toggle)
{
	let style = getComputedStyle(element);

	render('state', (container) =>
	{
		container.innerHTML = `
			<div class="editor-control">
				<label>States</label>
				<select class="editor-field-selector" data-editor-action="state">
					<option value="None">None</option>
					<option value="Hover">Hover</option>
					<option value="Pressed">Pressed</option>
					<option value="Focused">Focused</option>
					<option value="Focused (keyboard)">Focused (keyboard)</option>
					<option value="Visited">Visited</option>
				</select>
			</div>
		`;

		const state = container.querySelector('[data-editor-action="state"]');
	});

	render('screen-size', (container) =>
	{
		container.innerHTML = `
			<div class="editor-control">
				<label>Screen Size</label>
				<select class="editor-field-selector" data-editor-action="screen-size">
					<option value="desktop">Desktop</option>
					<option value="tablet">Tablet</option>
					<option value="mobile-landscape">Mobile Landscape</option>
					<option value="mobile-portrait">Mobile Portrait</option>
				</select>
			</div>
			<hr class="editor-separator" />
		`;

		const screenSize = container.querySelector('[data-editor-action="screen-size"]');
	});

	render('display', (container) =>
	{
		container.innerHTML = `
			<div class="editor-group">
				<div class="group-header">
					<label>Display</label>
					<span>
						<i class="fas fa-caret-down"></i>
					</span>
				</div>
				<select class="editor-field-selector">
					<optgroup label="Block-level">
						<option value="block">Block</option>
						<option value="flow-root">Flow Root</option>
						<option value="list-item">List Item</option>
					</optgroup>
				
					<optgroup label="Inline-level">
						<option value="inline">Inline</option>
						<option value="inline-block">Inline Block</option>
						<option value="inline-table">Inline Table</option>
						<option value="contents">Contents</option>
					</optgroup>
				
					<optgroup label="Flex/Grid">
						<option value="flex">Flex</option>
						<option value="inline-flex">Inline Flex</option>
						<option value="grid">Grid</option>
						<option value="inline-grid">Inline Grid</option>
					</optgroup>
				
					<optgroup label="Table">
						<option value="table">Table</option>
						<option value="inline-table">Inline Table</option>
					</optgroup>
				
					<optgroup label="Hidden">
						<option value="none">None</option>
					</optgroup>
				</select>
			</div>
		`;
	});

	render('spacing', (container) =>
	{
		container.innerHTML = `
			<div class="editor-group">
				<div class="group-header">
					<label>Spacing</label>
					<span>
						<i class="fas fa-caret-down"></i>
					</span>
				</div>
				<div class="group-grid">
					<div class="editor-control">
						<label>Margin Top</label>
						<input type="text" placeholder="0px" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Margin Bottom</label>
						<input type="text" placeholder="0px" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Margin Right</label>
						<input type="text" placeholder="0px" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Margin Left</label>
						<input type="text" placeholder="0px" class="editor-field-text" />
					</div>
				</div>
			</div>
		`;
	});

	render('size', (container) =>
	{
		container.innerHTML = `
			<div class="editor-group">
				<div class="group-header">
					<label>Size</label>
					<span>
						<i class="fas fa-caret-down"></i>
					</span>
				</div>
				<div class="group-grid">
					<div class="editor-control">
						<label>Width</label>
						<input type="text" placeholder="Auto" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Height</label>
						<input type="text" placeholder="Auto" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Min. Width</label>
						<input type="text" placeholder="0px" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Min. Height</label>
						<input type="text" placeholder="0px" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Max. Width</label>
						<input type="text" placeholder="None" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Max. Height</label>
						<input type="text" placeholder="None" class="editor-field-text" />
					</div>
				</div>
				<div class="editor-control">
					<label>Overflow</label>
					<select class="editor-field-selector">
						<option value="visible">Visible</option>
						<option value="hidden">Hidden</option>
						<option value="scroll">Scroll</option>
						<option value="auto">Auto</option>
						<option value="clip">Clip</option>
					</select>
				</div>
			</div>
		`;
	});

	render('position', (container) =>
	{
		container.innerHTML = `
			<div class="editor-group">
				<div class="group-header">
					<label>Position</label>
					<span>
						<i class="fas fa-caret-down"></i>
					</span>
				</div>
				<select class="editor-field-selector">
					<option value="static">Static</option>
					<option value="relative">Relative</option>
					<option value="absolute">Absolute</option>
					<option value="fixed">Fixed</option>
					<option value="sticky">Sticky</option>
				</select>
				<div class="group-grid">
					<div class="editor-control">
						<label>Top</label>
						<input type="text" placeholder="Auto" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Bottom</label>
						<input type="text" placeholder="Auto" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Left</label>
						<input type="text" placeholder="Auto" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Right</label>
						<input type="text" placeholder="Auto" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Float</label>
						<select class="editor-field-selector">
							<option value="none">None</option>
							<option value="left">Left</option>
							<option value="right">Right</option>
							<option value="inline-start">Inline Start</option>
							<option value="inline-end">Inline End</option>
						</select>
					</div>
					<div class="editor-control">
						<label>Clear</label>
						<select class="editor-field-selector">
							<option value="none">None</option>
							<option value="left">Left</option>
							<option value="right">Right</option>
							<option value="both">Both</option>
							<option value="inline-start">Inline Start</option>
							<option value="inline-end">Inline End</option>
						</select>
					</div>
				</div>
			</div>
		`;
	});

	render('typography', (container) =>
	{
		container.innerHTML = `
			<div class="editor-group">
				<div class="group-header">
					<label>Typography</label>
					<span>
						<i class="fas fa-caret-down"></i>
					</span>
				</div>
				<div class="editor-control">
					<label>Font</label>
					<select class="editor-field-selector">
						<option>Varela Round</option>
					</select>
				</div>
				<div class="editor-control">
					<label>Weight</label>
					<select class="editor-field-selector">
						<option value="normal">Normal</option>
						<option value="bold">Bold</option>
						<option value="bolder">Bolder</option>
						<option value="lighter">Lighter</option>
						<option value="100">100 (Thin)</option>
						<option value="200">200 (Extra Light)</option>
						<option value="300">300 (Light)</option>
						<option value="400">400 (Normal)</option>
						<option value="500">500 (Medium)</option>
						<option value="600">600 (Semi Bold)</option>
						<option value="700">700 (Bold)</option>
						<option value="800">800 (Extra Bold)</option>
						<option value="900">900 (Black)</option>
					</select>
				</div>
				<div class="editor-control">
					<label>Color</label>
					<input type="color" placeholder="#333" class="editor-field-text" />
				</div>
				<div class="group-grid">
					<div class="editor-control">
						<label>Size</label>
						<input type="text" placeholder="14px" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Height</label>
						<input type="text" placeholder="20px" class="editor-field-text" />
					</div>
					<div class="editor-control">
						<label>Align</label>
						<select class="editor-field-selector">
							<option value="left">Left</option>
							<option value="center">Center</option>
							<option value="right">Right</option>
							<option value="justify">Justify</option>
							<option value="start">Start</option>
							<option value="end">End</option>
						</select>
					</div>
					<div class="editor-control">
						<label>Decor</label>
						<select class="editor-field-selector">
							<option value="none">None</option>
							<option value="underline">Underline</option>
							<option value="overline">Overline</option>
							<option value="line-through">Line Through</option>
							<option value="blink">Blink</option>
						</select>
					</div>
				</div>
			</div>
		`;
	});

	render('backgrounds', (container) =>
	{
		container.innerHTML = `
			<div class="editor-group">
				<div class="group-header">
					<label>Backgrounds</label>
					<span>
						<i class="fas fa-caret-down"></i>
					</span>
				</div>
				<div class="editor-control">
					<label>Type</label>
					<select class="editor-field-selector">
						<option>Image</option>
						<option>Linear Gradient</option>
						<option>Radial Gradient</option>
						<option>Color Overlay</option>
					</select>
				</div>
				<div class="editor-control">
					<label>Color</label>
					<input type="color" placeholder="#333" class="editor-field-text" />
				</div>
				<div class="editor-control">
					<label>Clipping</label>
					<select class="editor-field-selector">
						<option>None</option>
						<option>Clip background to padding</option>
						<option>Clip background to content</option>
						<option>Clip background to text</option>
					</select>
				</div>
			</div>
		`;
	});

	render('borders', (container) =>
	{
		container.innerHTML = `
			<div class="editor-group">
				<div class="group-header">
					<label>Borders</label>
					<span>
						<i class="fas fa-caret-down"></i>
					</span>
				</div>
				<select class="editor-field-selector">
					<option>All Corners</option>
					<option>Individual Corners</option>
				</select>
				<div class="editor-control editor-group-property">
					<label>Border Top</label>
					<div class="group-grid">
						<div class="editor-control">
							<label>Style</label>
							<select class="editor-field-selector">
								<option>None</option>
								<option>Solid</option>
								<option>Dashed</option>
								<option>Dotted</option>
							</select>
						</div>
						<div class="editor-control">
							<label>Width</label>
							<input type="text" placeholder="0px" class="editor-field-text"/>
						</div>
						<div class="editor-control">
							<label>Width</label>
							<input type="color" placeholder="black" class="editor-field-text"/>
						</div>
					</div>
				</div>
				<div class="editor-control editor-group-property">
					<label>Border Bottom</label>
					<div class="group-grid">
						<div class="editor-control">
							<label>Style</label>
							<select class="editor-field-selector">
								<option>None</option>
								<option>Solid</option>
								<option>Dashed</option>
								<option>Dotted</option>
							</select>
						</div>
						<div class="editor-control">
							<label>Width</label>
							<input type="text" placeholder="0px" class="editor-field-text"/>
						</div>
						<div class="editor-control">
							<label>Width</label>
							<input type="color" placeholder="black" class="editor-field-text"/>
						</div>
					</div>
				</div>
				<div class="editor-control editor-group-property">
					<label>Border Left</label>
					<div class="group-grid">
						<div class="editor-control">
							<label>Style</label>
							<select class="editor-field-selector">
								<option>None</option>
								<option>Solid</option>
								<option>Dashed</option>
								<option>Dotted</option>
							</select>
						</div>
						<div class="editor-control">
							<label>Width</label>
							<input type="text" placeholder="0px" class="editor-field-text"/>
						</div>
						<div class="editor-control">
							<label>Width</label>
							<input type="color" placeholder="black" class="editor-field-text"/>
						</div>
					</div>
				</div>
				<div class="editor-control editor-group-property">
					<label>Border Right</label>
					<div class="group-grid">
						<div class="editor-control">
							<label>Style</label>
							<select class="editor-field-selector">
								<option>None</option>
								<option>Solid</option>
								<option>Dashed</option>
								<option>Dotted</option>
							</select>
						</div>
						<div class="editor-control">
							<label>Width</label>
							<input type="text" placeholder="0px" class="editor-field-text"/>
						</div>
						<div class="editor-control">
							<label>Width</label>
							<input type="color" placeholder="black" class="editor-field-text"/>
						</div>
					</div>
				</div>
			</div>
		`;
	});

	console.log(element, style);
}
