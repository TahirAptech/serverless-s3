const AWS = require('aws-sdk');
const {v4: uuid} = require('uuid');
const s3 = new AWS.S3();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

module.exports.handler = async (event) => {
  const sourceBucket = event.Records[0].s3.bucket.name;
  const sourceVideoKey = event.Records[0].s3.object.key;

  // const url = s3.getSignedUrl('getObject', {
  //   Bucket: sourceBucket,
  //   Key: sourceVideoKey,
  //   Expires: 1800
  // });
  const url = "https://upload-bucket2.s3.amazonaws.com/"+sourceVideoKey;
  // const url = await s3.getObject({ Bucket: sourceBucket, Key: sourceVideoKey }).promise();
  console.log("getSignedUrl", url);

  const execObj = await exec( //{ stdout, stderr }
    `ffmpeg -i ${url} -ss 1 -vframes 1 -y /tmp/output%d.jpg`
  );
  console.log("execObj", execObj);

  let fname = sourceVideoKey.replace("Videos/", "").split(".");
  fname.pop();
  fname = fname.join()+".jpg";
  console.log("fname", fname);
  await uploadFile(sourceBucket,"thumbnails/" +uuid()+ "/"+fname, "/tmp/output1.jpg", "image/jpg", async (filename) => {
    // console.log(`https://${sourceBucket}.s3.amazonaws.com/${filename}`);
  });
}

let uploadFile = async (bucket,fileName, location, contentType, callback) => {
  const params = {
    'Bucket' : bucket,
    'Key' : fileName,
    'Body' : fs.readFileSync(location),
    'ContentType' : contentType
  };
  try {
    let request = s3.putObject(params);
    let promise = request.promise();
    await promise.then( async response => {
      await callback(fileName);
    });
  }
  catch (error) {
    console.log(error);
  }
}





  // console.log("event2", JSON.stringify(event));
  // const s3 = new AWS.S3();
  // const sourceBucket = event.Records[0].s3.bucket.name;
  // const sourceKey = event.Records[0].s3.object.key;
  // const thumbnailBucket = 'thumbnail-bucket';
  // const thumbnailFolder = 'Thumbnails';

  // Define local paths
  
//   try {
//     const videoPath = 'src/video/myvideo.mp4';
//     const thumbnailPath = 'src/thumbnailImages/thumbnail.png';

//     ffmpeg(videoPath)
//       .on('end', function () {
//         console.log('Thumbnail successfully generated');
//       })
//       .on('error', function (err) {
//         console.error('Error generating thumbnail:', err);
//       })
//       .screenshots({
//         count: 1,
//         folder: thumbnailPath,
//         filename: 'thumbnail-%b.png'
//       });
//   } catch (error) {
//     console.error('Error:', error);
//     return {
//       statusCode: 500,
//       body: 'Error processing the video and generating the thumbnail.'
//     };
//   }
// };


  // try {
  //   // step 1: download video
  //   const video = await s3.getObject({ Bucket: sourceBucket, Key: sourceKey }).promise();

  //   console.log("video", video);

    // ffmpeg(fileStream)
    //   .on('filenames', (filenames) => {
    //     // Generate the thumbnail
    //     const thumbnailPath = `${filenames[0]}.jpg`;
    //     ffmpeg(fileStream)
    //       .screenshots({
    //         timestamps: ['10%'],
    //         filename: thumbnailPath,
    //         folder: '/tmp',
    //       })
    //       .on('end', () => {
    //         // Read the generated thumbnail file
    //         const thumbnail = fs.readFileSync(`/tmp/${thumbnailPath}`);

    //         // Upload the thumbnail to the output bucket
    //         s3.putObject(
    //           {
    //             Bucket: outputBucket,
    //             Key: outputKey,
    //             Body: thumbnail,
    //           },
    //           (error, data) => {
    //             if (error) {
    //               console.log('Error uploading thumbnail:', error);
    //             } else {
    //               console.log('Thumbnail uploaded successfully:', data);
    //             }
    //           }
    //         );
    //       });
    //   })
    //   .on('error', (error) => {
    //     console.log('Error generating thumbnail:', error);
    //   });
//   } catch (error) {
//     console.error(error);
//   }
// };