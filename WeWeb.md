# Datagrid
## Readonly/Edit States
1. In the editor, `editable` is the default state.
2. So, style each cell in the row to look editable.
3. Then, add a `readonly` state and style each element to look read-only.
4. The state will automatically be set by the datagrid component as the 'edit' pencil is clicked.

## Checkbox Component
1. Add a new input field named `Editable Datagrid Row ID?`
2. Add a workflow to Edit (Pencil) button that changes the `Editable Datagrid Row ID?` field value to the `Unique id` of the row.
3. Add a workflow to the Save and Cancel buttons that clears the `Editable Datagrid Row ID?` field value.
4. Bind the checkbox component's `Read only` property where the `Editable Datagrid Row ID?` != `Unique id`.

