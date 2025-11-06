const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Upload any file to S3 - Simple version
 */
async function uploadToS3(content, fileName, contentType = 'text/plain') {
    try {
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: uniqueFileName,
            Body: content,
            ContentType: contentType,
        });

        await s3Client.send(command);

        const signedUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: uniqueFileName,
            }),
            { expiresIn: parseInt(process.env.AWS_S3_URL_EXPIRATION) || 86400 }
        );

        console.log(`✅ Uploaded: ${uniqueFileName}`);

        return {
            success: true,
            key: uniqueFileName,
            url: signedUrl,
            fileName: uniqueFileName,
        };
    } catch (error) {
        console.error('❌ Upload Error:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }
}

/**
 * Helper functions
 */
async function uploadHTML(htmlContent, fileName) {
    return uploadToS3(htmlContent, fileName, 'text/html');
}

async function uploadPDF(pdfBuffer, fileName) {
    return uploadToS3(pdfBuffer, fileName, 'application/pdf');
}

async function uploadText(textContent, fileName) {
    return uploadToS3(textContent, fileName, 'text/plain');
}

async function uploadJSON(jsonData, fileName) {
    const jsonString = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData, null, 2);
    return uploadToS3(jsonString, fileName, 'application/json');
}

async function getSignedUrlForFile(fileName, expiresIn = 86400) {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        return signedUrl;
    } catch (error) {
        console.error('❌ Error generating signed URL:', error);
        throw error;
    }
}

module.exports = {
    uploadToS3,
    uploadHTML,
    uploadPDF,
    uploadText,
    uploadJSON,
    getSignedUrlForFile,
};