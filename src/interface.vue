<template>
	<div
		ref="wrapperRef"
		class="milkdown-editor-wrapper"
		:class="{ 'is-fullscreen': isFullscreen }"
		:style="wrapperStyle"
	>
		<button class="fullscreen-toggle" @click="toggleFullscreen" :title="isFullscreen ? 'Küçült' : 'Tam Ekran'">
			<svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
			<svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/></svg>
		</button>
		<div ref="editorRef" class="milkdown-editor-content"></div>
	</div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useApi } from '@directus/extensions-sdk';
import { Crepe } from '@milkdown/crepe';
import { replaceAll } from '@milkdown/utils';
import './css/crepe-common.css';
import './css/crepe-frame.css';

export default {
	props: {
		value: {
			type: String,
			default: '',
		},
		folder: {
			type: String,
			default: null,
		},
		editorHeight: {
			type: Number,
			default: null,
		},
		fontFamily: {
			type: String,
			default: '',
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		const wrapperRef = ref(null);
		const editorRef = ref(null);
		let crepe = null;
		let isUpdating = false;
		const isFocused = ref(false);
		const isFullscreen = ref(false);
		const api = useApi();

		const wrapperStyle = computed(() => {
			const style = {};
			if (!isFullscreen.value && props.editorHeight) {
				style.height = `${props.editorHeight}px`;
				style.maxHeight = `${props.editorHeight}px`;
				style.overflowY = 'auto';
			}
			if (props.fontFamily) {
				style['--milkdown-custom-font'] = props.fontFamily;
			}
			return style;
		});

		function toggleFullscreen() {
			isFullscreen.value = !isFullscreen.value;
			if (isFullscreen.value) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		}

		function handleEsc(e) {
			if (e.key === 'Escape' && isFullscreen.value) {
				toggleFullscreen();
			}
		}

		onMounted(async () => {
			document.addEventListener('keydown', handleEsc);

			if (editorRef.value) {
				crepe = new Crepe({
					root: editorRef.value,
					defaultValue: props.value || '',
					featureConfigs: {
						[Crepe.Feature.ImageBlock]: {
							onUpload: async (file) => {
								try {
									const formData = new FormData();
									if (props.folder) {
										formData.append('folder', props.folder);
									}
									formData.append('file', file);

									// Yükleme işlemini Directus API'si ile gerçekleştirin
									const response = await api.post('/files', formData, {
										headers: {
											'Content-Type': 'multipart/form-data',
										},
									});

									// Gelen dosyanın ID'sini base URL ile döndürün
									return `/assets/${response.data.data.id}`;
								} catch (error) {
									console.error('Resim yükleme hatası:', error);
									return ''; // Hata durumunda boş döndürün veya yedek bir resim URL'si sağlayın
								}
							},
						},
					},
				});

				crepe.on((listener) => {
					listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
						isUpdating = true;
						emit('input', markdown);
						setTimeout(() => {
							isUpdating = false;
						}, 0);
					});
				});

				await crepe.create();
			}
		});

		watch(() => props.value, (newValue) => {
			if (crepe && !isUpdating) {
				try {
					crepe.editor.action(replaceAll(newValue || ''));
				} catch(e) {
					// Ignore if error occurs during external value propagation
				}
			}
		});

		onBeforeUnmount(() => {
			document.removeEventListener('keydown', handleEsc);
			document.body.style.overflow = '';
			if (crepe) {
				crepe.destroy();
			}
		});

		return { wrapperRef, editorRef, isFocused, isFullscreen, wrapperStyle, toggleFullscreen };
	},
};
</script>

<style scoped>
.milkdown-editor-wrapper {
	border: var(--theme--border-width, var(--border-width, 2px)) solid var(--theme--form--field--input--border-color, var(--border-normal, #d3dae4));
	border-radius: var(--theme--border-radius, var(--border-radius, 6px));
	background: var(--theme--form--field--input--background, var(--background-page, #fff));
	min-height: 200px;
	padding: 0;
	transition: border-color var(--fast) var(--transition);
	position: relative;
}

.milkdown-editor-content {
	min-height: 200px;
}

.milkdown-editor-wrapper :deep(.milkdown-block-handle) {
	z-index: 10;
	left: 4px !important;
	background: var(--theme--background, var(--background-page, #fff));
	border: var(--theme--border-width, var(--border-width, 2px)) solid var(--theme--form--field--input--border-color, var(--border-normal, #d3dae4));
	border-radius: var(--theme--border-radius, var(--border-radius, 6px));
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.milkdown-editor-wrapper:hover {
	border-color: var(--theme--form--field--input--border-color-hover, var(--border-normal-alt, #a2b5cd));
}

.milkdown-editor-wrapper:focus-within {
	border-color: var(--theme--form--field--input--border-color-focus, var(--theme--primary, var(--primary, #6644ff)));
	box-shadow: 0 0 0 var(--theme--form--field--input--box-shadow-color-focus-size, 4px) var(--theme--form--field--input--box-shadow-color-focus, var(--primary-10, rgba(102, 68, 255, 0.1)));
}

/* Fullscreen toggle button */
.fullscreen-toggle {
	position: absolute;
	top: 8px;
	right: 8px;
	z-index: 20;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border: none;
	border-radius: var(--theme--border-radius, var(--border-radius, 6px));
	background: var(--theme--background-accent, var(--background-normal, #f0f4f9));
	color: var(--theme--foreground-subdued, var(--foreground-subdued, #a2b5cd));
	cursor: pointer;
	opacity: 0;
	transition: opacity 0.2s, background 0.15s, color 0.15s;
}

.milkdown-editor-wrapper:hover .fullscreen-toggle,
.milkdown-editor-wrapper:focus-within .fullscreen-toggle {
	opacity: 1;
}

.fullscreen-toggle:hover {
	background: var(--theme--primary, var(--primary, #6644ff));
	color: #fff;
}

/* Fullscreen mode */
.milkdown-editor-wrapper.is-fullscreen {
	position: fixed;
	inset: 0;
	z-index: 9999;
	border-radius: 0;
	border: none;
	display: flex;
	flex-direction: column;
	background: var(--theme--background, var(--background-page, #fff));
}

.milkdown-editor-wrapper.is-fullscreen .milkdown-editor-content {
	overflow-y: auto;
	flex: 1;
	min-height: 0;
}

.milkdown-editor-wrapper.is-fullscreen .fullscreen-toggle {
	opacity: 1;
	position: fixed;
	top: 16px;
	right: 16px;
	z-index: 10000;
	background: var(--theme--background-accent, var(--background-normal, #f0f4f9));
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.milkdown-editor-wrapper.is-fullscreen :deep(.milkdown-block-handle) {
	z-index: 10000;
}

/* Crepe theme overrides to match Directus */
.milkdown-editor-wrapper :deep(.milkdown) {
	/* Map Crepe CSS variables to Directus CSS variables for native Light/Dark mode support */
	--crepe-color-background: var(--theme--background, var(--background-page, #ffffff));
	--crepe-color-on-background: var(--theme--foreground, var(--foreground-normal, #1e293b));
	--crepe-color-surface: var(--theme--background-accent, var(--background-normal, #f8fafc));
	--crepe-color-surface-low: var(--theme--background-subdued, var(--background-normal-alt, #f1f5f9));
	--crepe-color-on-surface: var(--theme--foreground, var(--foreground-normal, #1e293b));
	--crepe-color-on-surface-variant: var(--theme--foreground-subdued, var(--foreground-subdued, #94a3b8));
	--crepe-color-outline: var(--theme--foreground-subdued, var(--border-normal, #94a3b8)); /* Used for icons in Crepe */
	--crepe-color-primary: var(--theme--primary, var(--primary, #3b82f6));
	--crepe-color-secondary: var(--theme--background-subdued, var(--secondary, #e2e8f0));
	--crepe-color-on-secondary: var(--theme--foreground, var(--foreground-inverted, #1e293b));
	--crepe-color-inverse: var(--theme--foreground, var(--foreground-inverted, #1e293b));
	--crepe-color-on-inverse: var(--theme--background, var(--foreground-normal, #ffffff));
	--crepe-color-inline-code: var(--theme--danger, var(--danger, #ef4444));
	--crepe-color-error: var(--theme--danger, var(--danger, #ef4444));
	--crepe-color-hover: var(--theme--background-subdued, var(--background-normal-alt, #f1f5f9));
	--crepe-color-selected: color-mix(in srgb, var(--theme--primary, #3b82f6) 15%, transparent);
	--crepe-color-inline-area: var(--theme--background-subdued, var(--background-normal-alt, #e2e8f0));

	/* Fonts */
	--crepe-font-default: var(--milkdown-custom-font, var(--family-system));
	--crepe-font-title: var(--milkdown-custom-font, var(--family-system));
	--crepe-font-code: var(--family-monospace);
	
	background: transparent;
}
</style>
