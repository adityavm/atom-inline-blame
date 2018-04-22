'use babel';

import { CompositeDisposable } from "atom";

let InlineBlameView;

export default {
  watchedEditors: [],

  config: {
    format: {
      type: "string",
      default: `%author%, %relativeTime% ago - %summary%`,
      description: "Available tokens: author, authorEmail, relativeTime, authorTime, authorTimezone, committer, summary",
    },
    timeout: {
      type: "number",
      default: 200,
      description: "Delay after which the inline blame summary will be displayed. Useful when navigating using cursor keys to prevent unnecessarily fetching history for each line.",
    }
  },

  attachBlamer(editor) {
    if (!editor) return;

    const { id } = editor;
    if (!this.watchedEditors.includes(id)) {
      if (!InlineBlameView) {
        InlineBlameView = require("./InlineBlameView");
      }

      this.watchedEditors.push(id);
      new InlineBlameView();

      editor.onDidDestroy(() => {
        const idx = this.watchedEditors.indexOf(id);
        this.watchedEditors.splice(idx, 1);
      });
    }
  },

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor(this.attachBlamer.bind(this))); // subscribe to changing editors

    // Annotate current open buffer lazily
    window.requestIdleCallback(() => {
      const currentEditor = atom.workspace.getActiveTextEditor();
      if (currentEditor) {
        this.attachBlamer.bind(this)(currentEditor);
      }
    });
  },

  deactivate() {
    this.subscriptions.dispose();
  },
};
