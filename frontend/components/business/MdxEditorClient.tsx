"use client";

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertCodeBlock,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin
} from "@mdxeditor/editor";

export function MdxEditorClient({
  markdown,
  onChange
}: {
  markdown: string;
  onChange: (markdown: string) => void;
}) {
  return (
    <div className="mdx-editor-shell">
      <MDXEditor
        markdown={markdown}
        onChange={onChange}
        contentEditableClassName="mdx-editor-content"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "bash" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              bash: "Bash",
              shell: "Shell",
              text: "Text",
              json: "JSON",
              yaml: "YAML",
              dockerfile: "Dockerfile"
            }
          }),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <Separator />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <CodeToggle />
                <Separator />
                <ListsToggle />
                <CreateLink />
                <InsertTable />
                <InsertCodeBlock />
                <InsertThematicBreak />
              </>
            )
          })
        ]}
      />
    </div>
  );
}
