const readline = require('readline');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('YouTube video URL : ', async (url) => {
  const valid = await ytdl.validateURL(url);

  if (!valid) {
    console.log('\nInvalid URL!');
    rl.close();
    return;
  };

  // const id = await ytdl.getVideoID(url);

  try {
    const info = await ytdl.getBasicInfo(url);
    const forbid = /[\/\?<>\\:\*|"]/g;

    let title = `${info.videoDetails.title.replace(forbid, '-')}.mp3`;
    let stream = ytdl(url, { quality: 'highestaudio' });
    let start = Date.now();

    if (!fs.existsSync('downloads')) {
      fs.mkdirSync('downloads');
    };

    console.log(`Title : ${info.videoDetails.title}`);
    console.log('Select Format :\n1. MP3\n2. FLAC\n');

    rl.question('Format : ', async (format) => {
      if (format == '1') {
        ffmpeg(stream)
          .audioBitrate(128)
          .save(`downloads/${title}`)
          .on('start', () => console.log(`\nDownloading ${title}`))
          .on('progress', p => {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`${p.targetSize}kb downloaded`);
          })
          .on('end', () => console.log(`\nDone, ${title} downloaded!`));
      } else {
        title = `${title.split('.mp3')[0]}.flac`
        ffmpeg(stream)
          .audioCodec('flac')
          .save(`downloads/${title}`)
          .on('start', () => console.log(`\nDownloading ${title}`))
          .on('progress', p => {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`${p.targetSize}kb downloaded`);
          })
          .on('end', () => console.log(`\nDone, ${title} downloaded!`));
      };

      rl.close();
    });
  } catch (e) {
    console.log(e);
  };

  // rl.close();
});
