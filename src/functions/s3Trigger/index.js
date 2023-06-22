const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const bucket = process.env.S3_BUCKET;

module.exports.handler = async (event) => {
  console.log("event", JSON.stringify(event));
  const sourceBucket = event.Records[0].s3.bucket.name;
  const sourceVideoKey = event.Records[0].s3.object.key;

  const url = `https://${bucket}.s3.amazonaws.com/${sourceVideoKey}`;
  console.log("getSignedUrl", url);

  const execObj = await exec( //{ stdout, stderr }
    `ffmpeg -i ${url} -ss 1 -vframes 1 -y /tmp/output%d.jpg`
  );
  console.log("execObj", execObj);

  let fname = sourceVideoKey.replace("Videos/", "").split(".");
  fname.pop();
  fname = fname.join() + ".jpg";

  let name = `Thumbnails/${fname}`;
  console.log("fileName", name);

  await uploadFile(sourceBucket, name, "/tmp/output1.jpg", "image/jpg");
}

let uploadFile = async (bucket, fileName, location, contentType) => {
  const params = {
    'Bucket': bucket,
    'Key': fileName,
    'Body': fs.readFileSync(location),
    'ContentType': contentType
  };
  try {
    await s3.putObject(params).promise();
  }
  catch (error) {
    console.log(error);
  }
}
