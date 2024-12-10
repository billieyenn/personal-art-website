<template>
  <div ref="editor"></div>
</template>

<script>
/* eslint-enable */
/* eslint-disable */
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';

export default {
  name: 'CodeEditor',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  watch: { // Watch change caused by the reset button
    modelValue(newValue) {
      // Only update if the editor value is different to avoid cursor jump
      if (this.editor && this.editor.getValue() !== newValue) {
        this.editor.setValue(newValue, 1); // The '1' parameter puts cursor at end
      }
    }
  },
  mounted() {
    this.editor = ace.edit(this.$refs.editor, {
      mode: 'ace/mode/javascript',
      theme: 'ace/theme/monokai',
      value: this.modelValue,
      useWorker: false,
      // wrap: true,         // Enable word wrapping // i prefer horizontal scrolling for now
      showPrintMargin: false,  // Optional: removes the vertical line
      scrollPastEnd: 0.5  // Optional: Allows scrolling past the end by 50% of the screen
    });

    // Enable scrolling
    // this.editor.setOption('vScrollBarAlwaysVisible', true);
    // this.editor.setOption('hScrollBarAlwaysVisible', true);

    // resize handler
    this.editor.container.style.resize = 'none';
    this.editor.container.style.width = '100%';
    this.editor.container.style.height = '100%';
    this.editor.resize();

    this.editor.on('change', () => {
      this.$emit('update:modelValue', this.editor.getValue());
    });
  },
  beforeUnmount() {
    this.editor.destroy();
  },
};
</script>