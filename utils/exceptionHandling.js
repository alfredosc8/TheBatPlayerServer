/**
 * Created by gabek on 3/31/17.
 */

function setupExceptionHandling(express) {
    const logger = require('winston');
    const Raven = require('raven');

    // Must configure Raven before doing anything else with it
    if (process.env.RELEASE_ID && process.env.SENTRY_DSN) {
        logger.info('Release ID: ' + process.env.RELEASE_ID);

        Raven.config(process.env.SENTRY_DSN, {
            release: process.env.RELEASE_ID
        }).install();
    } else if (process.env.SENTRY_DSN) {
        logger.info('No Release ID in envionment.  Configuring Sentry without it.')
        Raven.config(process.env.SENTRY_DSN).install();
    } else {
        logger.info('No Sentry DSN available.  Not configuring.')

        process.on('uncaughtException', function (err) {
            logger.error(err);
        });

        return;
    }

    if (process.env.SENTRY_DSN) {
        // The request handler must be the first middleware on the app
        express.use(Raven.requestHandler());

        // The error handler must be before any other error middleware
        express.use(Raven.errorHandler());
    }

    process.on('unhandledRejection', function (err) {
        logger.error(err);
        if (Raven) {
            Raven.captureException(err);
        }

        //throw err;
    });

}

module.exports.setupExceptionHandling = setupExceptionHandling;