// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  dev: false,
  // baseurl:"https://digital-mrkt.tpfsoftware.com/api/v1/",
  // mqttHost:"digital-mrkt.tpfsoftware.com",
  // analyticsApiUrl: 'https://devanalytics.rapidturnaround.flights/analytics-api-2/api',
  analyticsApiUrl: 'https://devanalytics.rapidturnaround.flights/analytics-api-prod/api',
   mqttHost:"spicejet.rapidturnaround.flights",
   baseurl:"https://spicejet.rapidturnaround.flights/api/v1/",
  // mqttHost:"anz.rapidturnaround.flights",
  // baseurl:"https://anz.rapidturnaround.flights/api/v1/",
  // mqttHost:"spice.rapidturnaround.flights",
  // baseurl:"https://spice.rapidturnaround.flights/api/v1/",
  // mqttHost:"rtasandbox.rapidturnaround.flights",
  // baseurl:"https://rtasandbox.rapidturnaround.flights/api/v1/",
  // mqttHost: "spice.rapidturnaround.flights",
  // baseurl: "https://spice.rapidturnaround.flights/api/v1/",
  // mqttHost: "spicejet.rapidturnaround.flights",
  // baseurl: "http://localhost:3000/",

  mqttPort: 8884
};