/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Using Autodesk Forge API to upload, translate, delete the BIM models.
// For more information, please visit https://forge.autodesk.com/en/docs/oauth/v2/developers_guide/
// Also, when you download forge-api package, please read its documentation, 
// which is able to solve most of your questions.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const {
    DerivativesApi,
    JobPayload,
    JobPayloadInput,
    JobPayloadOutput,
    JobSvfOutputPayload
} = require('forge-apis');

var CLIENT_ID = process.env.FORGE_CLIENT_ID,
    CLIENT_SECRET = process.env.FORGE_CLIENT_SECRET;

var ForgeSDK = require('../node_modules/forge-apis/src/index');

const {
    getClient,
    getInternalToken
} = require('./common/oauth');

let router = express.Router();

//2-legged authorization
var oAuth2TwoLegged = new ForgeSDK.AuthClientTwoLegged(CLIENT_ID, CLIENT_SECRET,
    ['data:write', 'data:read', 'bucket:read', 'bucket:update', 'bucket:create', 'bucket:delete'], true);

//APIs used to delete Bucket and object
var bucketsApi = new ForgeSDK.BucketsApi(), // Buckets Client
    objectsApi = new ForgeSDK.ObjectsApi(); // Objects Client

//Middleware for obtaining a token for each request.
router.use(async (req, res, next) => {
    const token = await getInternalToken();
    req.oauth_token = token;
    req.oauth_client = getClient();
    next();
});

// POST /api/forge/modelderivative/jobs - submits a new translation job for given object URN.
// Request body must be a valid JSON in the form of { "objectName": "<translated-object-urn>" }.
router.post('/jobs', async (req, res, next) => {
    let job = new JobPayload();
    job.input = new JobPayloadInput();
    job.input.urn = req.body.objectName;
    job.output = new JobPayloadOutput([
        new JobSvfOutputPayload()
    ]);
    job.output.formats[0].type = 'svf';
    job.output.formats[0].views = ['2d', '3d'];
    try {
        // Submit a translation job using [DerivativesApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/DerivativesApi.md#translate).
        await new DerivativesApi().translate(job, {}, req.oauth_client, req.oauth_token);
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

/**
 * Delete Object.
 * @param bucketKey
 * @param fileName
 */
router.post('/jobs/deleteobject',  (req, res, next) => {
    bucketKey = req.body.bucketKey;
    RealObjectName = req.body.fileRealName;
    console.log('bucket:' + bucketKey);
    console.log('fileName:' + RealObjectName);
    var deleteFile = function(bucketKey, RealObjectName) {
        console.log("**** Deleting file from bucket:" + bucketKey + ", filename:"+RealObjectName);
        return objectsApi.deleteObject(bucketKey,RealObjectName,oAuth2TwoLegged, oAuth2TwoLegged.getCredentials());
    };
    try {
        oAuth2TwoLegged.authenticate().then(function(credentials){
            console.log("**** Obtain Credentials",credentials);
            
            deleteFile(bucketKey, RealObjectName).then(function(deleteRes) {
                console.log("**** When returning 200, the program runs with no error.:", deleteRes.statusCode);
            },defaultHandleError);
        }, defaultHandleError);
        res.status(200).end();

    } catch (err) {
        next(err);
    }
});

/**
 * Delete Bucket.
 * @param bucketKey
 */
router.post('/jobs/deletebucket',  (req, res, next) => {
    bucketKey = req.body.bucketKey;
    console.log('bucket:' + bucketKey);
    var deleteBucket = function(bucketKey) {
        console.log("**** Delete bucket:" + bucketKey);
        return bucketsApi.deleteBucket(bucketKey,oAuth2TwoLegged, oAuth2TwoLegged.getCredentials());
    };

    try {
        oAuth2TwoLegged.authenticate().then(function(credentials){
            console.log("**** Obtain Credentials",credentials);
            deleteBucket(bucketKey).then(function(deleteRes) {
                console.log("**** When returning 200, the program runs with no error.:", deleteRes.statusCode);
            },defaultHandleError);
        }, defaultHandleError);
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

/////////////////////////////////////////Error alert////////////////////////////////////////////////////
function defaultHandleError(err) {
    console.error('\x1b[31m Error:', err, '\x1b[0m');
}

/////////////////////////////////////Get all the buckets////////////////////////////////////////////////
var getBuckets = function () {
    console.log("**** Getting all buckets");
    return bucketsApi.getBuckets({}, oAuth2TwoLegged, oAuth2TwoLegged.getCredentials());
};

module.exports = router;