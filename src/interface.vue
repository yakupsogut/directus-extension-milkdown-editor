<template>
	<div ref="editorRef" class="milkdown-editor-wrapper" :class="{ 'has-focus': isFocused }"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
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
	},
	emits: ['input'],
	setup(props, { emit }) {
		const editorRef = ref(null);
		let crepe = null;
		let isUpdating = false;
		const isFocused = ref(false);
		const api = useApi();

		onMounted(async () => {
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
				
				// Optional: track focus if crepe exposes it, or we can just rely on css focus-within
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
			if (crepe) {
				crepe.destroy();
			}
		});

		return { editorRef, isFocused };
	},
};
</script>

<style scoped>
.milkdown-editor-wrapper {
	border: var(--border-width) solid var(--border-normal);
	border-radius: var(--border-radius);
	background: var(--background-page);
	min-height: 200px;
	transition: border-color var(--fast) var(--transition);
}

.milkdown-editor-wrapper:hover {
	border-color: var(--border-normal-alt);
}

.milkdown-editor-wrapper:focus-within {
	border-color: var(--primary);
	box-shadow: 0 0 0 4px var(--primary-10);
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
	--crepe-font-default: var(--family-system);
	--crepe-font-title: var(--family-system);
	--crepe-font-code: var(--family-monospace);
	
	background: transparent;
}
</style>
