const AWS = require('aws-sdk');
const dayjs = require('dayjs');

module.exports.handler = async (event) => {
  console.log("event", event);
  console.log("empty console");
  const { fileName , fileType} = JSON.parse(event.body);
  const s3 = new AWS.S3();
  // const randomID = parseInt(Math.random() * 10000000)
  // const Key = `${randomID}`;

  const params = {
    Bucket: `upload-bucket2/${fileType.includes("image") ? 'Images' : 'Videos'}`,
    Key: `${dayjs().unix()}-${fileName.replaceAll(" ","")}`,
    Expires: 1800, // Set the presigned URL expiry time to 30 minutes (in seconds)
    ContentType: fileType //'image/jpeg'
  }
  console.log("params", params);
  try {
    const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
    console.log("presignedUrl", presignedUrl);
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: presignedUrl
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message
      })
    }
  }
};
