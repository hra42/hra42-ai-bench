/**
 * Convert a File to a base64 data URL
 */
export async function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result);
			} else {
				reject(new Error('Failed to convert file to base64'));
			}
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}

/**
 * Extract the base64 content from a data URL
 */
export function extractBase64Content(dataUrl: string): string {
	const base64Prefix = 'base64,';
	const index = dataUrl.indexOf(base64Prefix);
	if (index === -1) {
		throw new Error('Invalid base64 data URL');
	}
	return dataUrl.substring(index + base64Prefix.length);
}

/**
 * Get the MIME type from a data URL
 */
export function getMimeTypeFromDataUrl(dataUrl: string): string {
	const match = dataUrl.match(/^data:([^;]+);/);
	return match ? match[1] : 'application/octet-stream';
}

/**
 * Validate if a file is an accepted image type
 */
export function isValidImageFile(file: File): boolean {
	const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
	return acceptedTypes.includes(file.type);
}

/**
 * Process an image file for API submission
 */
export async function processImageForApi(file: File): Promise<{
	dataUrl: string;
	mimeType: string;
	base64Content: string;
}> {
	if (!isValidImageFile(file)) {
		throw new Error(`Invalid image type: ${file.type}. Accepted types: JPEG, PNG, WebP, GIF`);
	}

	const dataUrl = await fileToBase64(file);
	const mimeType = getMimeTypeFromDataUrl(dataUrl);
	const base64Content = extractBase64Content(dataUrl);

	return {
		dataUrl,
		mimeType,
		base64Content
	};
}
