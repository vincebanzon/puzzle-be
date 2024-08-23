Pre-requisites:
Make sure Mongo DB service is running


Verify Mongo DB has a database called "puzzle"

The rest of the collections will be auto populated by running this project.

### Running the project in Development mode

$ npm run dev

### To deploy this project

Make sure pm2 is installed.

$ pm2 --version

Verify if service is already running by checking the list of PM2 services

$ pm2 list

If service is already running, restart PM2 to take effect changes.
Depending in the ID of the service, change value 0 to the ID:

$ pm2 restart 0

If this is your first time to deploy, run the command below with the directory of the project:

$ pm2 start /root/splash-be/index.js

Verify that it is running:

$ pm2 status

To debug in Production environment run the command with the corresponding ID:

$ pm2 logs 0


#### Note:
In real environment,
I would configure the cors to allow only the list of frontend that we have.
For now, since this is a test environment, I do not have control where the examiner will test my output, so I'm allow the CORS for all.



