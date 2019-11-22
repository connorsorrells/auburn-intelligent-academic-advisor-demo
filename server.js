'use strict';
var express = require('express'); // eslint-disable-line node/no-missing-require
var app = express();
var expressBrowserify = require('express-browserify'); // eslint-disable-line node/no-missing-require
var dotenv = require('dotenv');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1.js');
const AuthorizationV1 = require('ibm-watson/authorization/v1')
const { IamAuthenticator } = require('ibm-watson/auth');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const vcapServices = require('vcap_services');

// optional: load environment properties from a .env file
dotenv.config();

const isDev = app.get('env') === 'development';
app.get(
  '/bundle.js',
  expressBrowserify('public/js/custom.js', {
    watch: isDev,
    debug: isDev
  })
);

app.use(express.static('public/'));

app.enable('trust proxy');

const textToSpeech = new TextToSpeechV1({
    version: '2018-04-05',
    authenticator: new IamAuthenticator({
      apikey: process.env.TEXT_TO_SPEECH_IAM_APIKEY,
    }),
    url: process.env.TEXT_TO_SPEECH_URL || 'https://stream.watsonplatform.net/text-to-speech/api'
});

// Only loaded when running in IBM Cloud
if (process.env.VCAP_APPLICATION) {
    require('./config/security')(app);
  }

  // automatically bundle the front-end js on the fly
  // note: this should come before the express.static since bundle.js is in the public folder
  const browserifyier = expressBrowserify('public/js/custom.js', {
    watch: isDev,
    debug: isDev
  });
  app.get('/js/bundle.js', browserifyier);

  // Configure Express
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(express.static(path.join(__dirname, '..', 'node_modules/watson-react-components/dist/')));
  app.use(morgan('dev'));

  const ttsCredentials = Object.assign(
    {
      authenticator: new IamAuthenticator({
        apikey: process.env.TEXT_TO_SPEECH_IAM_APIKEY,
      }),
      username: process.env.TEXT_TO_SPEECH_USERNAME, // or hard-code credentials here
      password: process.env.TEXT_TO_SPEECH_PASSWORD,
      iam_apikey: process.env.TEXT_TO_SPEECH_IAM_APIKEY, // if using an RC service
      url: process.env.TEXT_TO_SPEECH_URL || 'https://stream.watsonplatform.net/text-to-speech/api'
    },
    vcapServices.getCredentials('text_to_speech') // pulls credentials from environment in bluemix, otherwise returns {}
  );
  
  app.use('/api/text-to-speech/token', function(req, res) {
    const ttsAuthService = new AuthorizationV1(ttsCredentials);
    ttsAuthService.getToken(function(err, response) {
      if (err) {
        console.log('Error retrieving token: ', err);
        res.status(500).send('Error retrieving token');
        return;
      }
      const token = response.token || response;
      res.json({ accessToken: token, url: ttsCredentials.url });
    });
  });

const getFileExtension = (acceptQuery) => {
    const accept = acceptQuery || '';
    switch (accept) {
      case 'audio/ogg;codecs=opus':
      case 'audio/ogg;codecs=vorbis':
        return 'ogg';
      case 'audio/wav':
        return 'wav';
      case 'audio/mpeg':
        return 'mpeg';
      case 'audio/webm':
        return 'webm';
      case 'audio/flac':
        return 'flac';
      default:
        return 'mp3';
    }
  };
  
  app.get('/', (req, res) => {
    res.render('index');
  });
  
  /**
   * Pipe the synthesize method
   */
  app.get('/api/v1/synthesize', async (req, res, next) => {
    try {
      const { result } = await textToSpeech.synthesize(req.query);
      const transcript = result;
      transcript.on('response', (response) => {
        if (req.query.download) {
          response.headers['content-disposition'] = `attachment; filename=transcript.${getFileExtension(req.query.accept)}`;
        }
      });
      transcript.on('error', next);
      transcript.pipe(res);
    } catch (error) {
      res.send(error);
    }
  });
  
  // error-handler settings
  require('./config/error-handler')(app);

var port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;
app.listen(port, function() {
  console.log('Server running on port %d', port);
});