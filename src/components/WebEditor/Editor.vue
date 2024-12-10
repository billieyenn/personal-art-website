<template>
  <div ref="editor" class="container"></div>
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
  mounted() {
    this.editor = ace.edit(this.$refs.editor, {
      mode: 'ace/mode/javascript',
      theme: 'ace/theme/monokai',
      value: this.modelValue,
      useWorker: false,
    });

    this.editor.on('change', () => {
      this.$emit('update:modelValue', this.editor.getValue());
    });
  },
  beforeUnmount() {
    this.editor.destroy();
  },
};
</script>


<style scoped>
.container {
  height: 400px; 
  width: 100%;
}
</style>