const Airtable = require('airtable');
const { uploadToS3 } = require('./s3-storage');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
);

/**
 * Upload content to S3 and update Airtable field
 */
async function uploadAndUpdate(recordId, content, fileName, contentType, fieldId) {
    try {
        // Upload to S3
        const result = await uploadToS3(content, fileName, contentType);
        
        // Update Airtable
        await base(process.env.AIRTABLE_TABLE_NAME).update(recordId, {
            [fieldId]: result.url,
        });

        console.log(`✅ Updated Airtable record ${recordId}, field ${fieldId}`);
        return result;
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

/**
 * Upload GitHub link
 */
async function uploadGitHubLink(recordId, linkContent, fileName = 'github-link.txt') {
    return uploadAndUpdate(
        recordId,
        linkContent,
        fileName,
        'text/plain',
        process.env.NEXT_PUBLIC_FIELD_GITHUB_LINKS
    );
}

/**
 * Upload GitHub description
 */
async function uploadGitHubDescription(recordId, description, fileName = 'github-description.txt') {
    return uploadAndUpdate(
        recordId,
        description,
        fileName,
        'text/plain',
        process.env.AIRTABLE_GITHUB_DESC_FIELD_ID
    );
}

/**
 * Upload Drive link
 */
async function uploadDriveLink(recordId, linkContent, fileName = 'drive-link.txt') {
    return uploadAndUpdate(
        recordId,
        linkContent,
        fileName,
        'text/plain',
        process.env.NEXT_PUBLIC_FIELD_DRIVE_LINKS
    );
}

/**
 * Upload Drive description
 */
async function uploadDriveDescription(recordId, description, fileName = 'drive-description.txt') {
    return uploadAndUpdate(
        recordId,
        description,
        fileName,
        'text/plain',
        process.env.AIRTABLE_DRIVE_DESC_FIELD_ID
    );
}

/**
 * Upload Other link
 */
async function uploadOtherLink(recordId, linkContent, fileName = 'other-link.txt') {
    return uploadAndUpdate(
        recordId,
        linkContent,
        fileName,
        'text/plain',
        process.env.NEXT_PUBLIC_FIELD_OTHER_LINKS
    );
}

/**
 * Upload Other description
 */
async function uploadOtherDescription(recordId, description, fileName = 'other-description.txt') {
    return uploadAndUpdate(
        recordId,
        description,
        fileName,
        'text/plain',
        process.env.AIRTABLE_OTHER_DESC_FIELD_ID
    );
}

/**
 * Upload all data
 */
async function uploadAllCandidateData(recordId, data) {
    const {
        candidateName,
        githubLink,
        githubDescription,
        driveLink,
        driveDescription,
        otherLink,
        otherDescription,
        feedback,
        transcript,
        htmlReport,
    } = data;

    const results = {};

    try {
        if (githubLink) {
            results.githubLink = await uploadGitHubLink(recordId, githubLink, `${candidateName}-github-link.txt`);
        }
        if (githubDescription) {
            results.githubDesc = await uploadGitHubDescription(recordId, githubDescription, `${candidateName}-github-desc.txt`);
        }
        if (driveLink) {
            results.driveLink = await uploadDriveLink(recordId, driveLink, `${candidateName}-drive-link.txt`);
        }
        if (driveDescription) {
            results.driveDesc = await uploadDriveDescription(recordId, driveDescription, `${candidateName}-drive-desc.txt`);
        }
        if (otherLink) {
            results.otherLink = await uploadOtherLink(recordId, otherLink, `${candidateName}-other-link.txt`);
        }
        if (otherDescription) {
            results.otherDesc = await uploadOtherDescription(recordId, otherDescription, `${candidateName}-other-desc.txt`);
        }

        console.log(`✅ All data uploaded for ${candidateName}`);
        return results;
    } catch (error) {
        console.error('❌ Error uploading all data:', error);
        throw error;
    }
}

module.exports = {
    uploadGitHubLink,
    uploadGitHubDescription,
    uploadDriveLink,
    uploadDriveDescription,
    uploadOtherLink,
    uploadOtherDescription,
    uploadAllCandidateData,
};