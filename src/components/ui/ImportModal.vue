<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-panel animate-scale-in">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Import Palette</h2>
            <p class="modal-desc">Paste HEX values separated by commas, spaces, or line breaks</p>
          </div>
          <button class="btn btn-ghost btn-icon" @click="emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <textarea
            v-model="rawInput"
            class="import-textarea"
            placeholder="#FFBE0B, #FB5607, #FF006E, #8338EC, #3A86FF"
            rows="6"
            spellcheck="false"
            autofocus
          />

          <!-- Preview -->
          <div v-if="parsed.length > 0" class="preview-section">
            <div class="preview-label">
              <span>{{ parsed.length }} valid color{{ parsed.length !== 1 ? 's' : '' }} detected</span>
              <span v-if="invalidCount > 0" class="invalid-note">{{ invalidCount }} invalid skipped</span>
            </div>
            <div class="preview-swatches">
              <div
                v-for="hex in parsed"
                :key="hex"
                class="import-swatch"
                :style="{ background: hex }"
                :title="hex"
              >
                <span class="swatch-label">{{ hex }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="rawInput.trim().length > 0" class="no-valid">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            No valid HEX colors found. Make sure to include the # prefix.
          </div>

          <div class="import-examples">
            <p class="examples-label">Examples:</p>
            <code class="example-code">#FFBE0B, #FB5607, #FF006E</code>
            <code class="example-code">#FFBE0B #FB5607 #FF006E</code>
            <code class="example-code">#FFBE0B<br>#FB5607<br>#FF006E</code>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="emit('close')">Cancel</button>
          <button
            class="btn btn-primary"
            :disabled="parsed.length === 0"
            @click="handleImport"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Import {{ parsed.length }} Color{{ parsed.length !== 1 ? 's' : '' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseHexInput } from '../../composables/useColorUtils'

const emit = defineEmits<{
  close: []
  import: [raw: string]
}>()

const rawInput = ref('')

const parsed = computed(() => parseHexInput(rawInput.value))
const invalidCount = computed(() => {
  const raw = rawInput.value.split(/[\s,;\n\r]+/).filter(t => t.trim().length > 0)
  return raw.length - parsed.value.length
})

function handleImport() {
  if (parsed.value.length > 0) {
    emit('import', rawInput.value)
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.modal-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 520px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border-default);
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.modal-desc {
  font-size: 12px;
  color: var(--text-tertiary);
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.import-textarea {
  width: 100%;
  padding: 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  line-height: 1.6;
}

.import-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.import-textarea::placeholder {
  color: var(--text-tertiary);
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

.invalid-note {
  color: var(--warning);
}

.preview-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.import-swatch {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1), var(--shadow-sm);
  position: relative;
  cursor: default;
  transition: transform 0.15s;
}

.import-swatch:hover {
  transform: scale(1.1);
  z-index: 1;
}

.swatch-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  white-space: nowrap;
  color: var(--text-tertiary);
  font-family: 'JetBrains Mono', monospace;
  opacity: 0;
  transition: opacity 0.15s;
}

.import-swatch:hover .swatch-label {
  opacity: 1;
}

.no-valid {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--error);
  padding: 10px 12px;
  background: var(--error-soft);
  border-radius: var(--radius-sm);
}

.import-examples {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.examples-label {
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: 500;
  margin-bottom: 2px;
}

.example-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-subtle);
  padding: 4px 8px;
  border-radius: 4px;
  display: block;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-default);
  background: var(--bg-base);
}

button:disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
