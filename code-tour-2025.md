# A Tour of My Sample Code (January 2025)

## AI-Powered Content Moderation at PeopleConnect

[CommentService.ts](https://github.com/thujone/backend-samples-2024/blob/main/CommentService.ts)

[ModerationWorker.ts](https://github.com/thujone/backend-samples-2024/blob/main/ModerationWorker.ts)

At my most recent position at PeopleConnect, the main project I worked on was building an automated moderation system for user-generated content using OpenAI API. The problem was that we wanted to allow users to add helpful comments to their own background reports or to others that they know. The issue with this is that many people add unhelpful or negative or violent or harassing information. They might also post private information such as social security number or other data that would be in violation of the Fair Credit Reporting Act. Finally, customer support representatives were approving or rejecting user-generated comments manually, which was tedious and had a slow turnaround (typically 48 hours or longer).

I built the back end that allowed a user to add a comment and get immediate feedback (approval or rejection), and the comment would posted immediately. I also developed a spot-check report that customer service reps could monitor weekly to make sure the system was making correct decisions.

The back end system was built using Node, TypeScript, and GraphQL, the latter two being completely new to me. When a user posts a new comment, it's put into Postgres, and two serial calls are made to the OpenAI API. The first is a quick screening for obvious violations, like harassing, violent, or sexual content. If it passes this test, then we supply a prompt with all the rules we expect the content to follow, such as being helpful, not saying anything negative or private about the person's profile, etcetera. The second call decides whether the content is approved or not and why. That data is written back to Postgres, and the decision is sent back through the GraphQL interface. The client (TruthFinder.com, Intelius.com, InstantCheckmate.com) is told whether or not the comment can be displayed on the profile.

## One-Line Diagramming App at Xendee Corporation

[Screenshots Directory](https://github.com/thujone/code-samples/tree/main/xendee/one-line-app/screenshots)

[app.js](https://github.com/thujone/code-samples/blob/main/xendee/one-line-app/client/app.js)

[constants.js](https://github.com/thujone/code-samples/blob/main/xendee/one-line-app/client/constants.js)

[topography.js](https://github.com/thujone/code-samples/blob/main/xendee/one-line-app/client/topography/topography.js)

I spent about a year building this application from scratch. As the first full-time engineering hire at Xendee, I worked very closely with a backend (ASP.NET/C#) person (my supervisor) and a graphic designer. The web application is about 40,000 lines of JavaScript. It's an app that allows power engineers to plan the technical implementation of a microgrid, including putting power generators (e.g., solar PV, wind turbines, nuclear reactors), transformers, and power consumers (e.g., EV chargers, HVAC, refrigeration) on a topographic map using Google Maps; generating a one-line diagram using the YWorks graphical library; and running various power flow analyses to look for inefficiencies or short circuits. Results were forwarded to the Economic Optimizer app, described below.

## Economic Optimizer App at Xendee Corporation

[Screenshots Directory](https://github.com/thujone/code-samples/tree/main/xendee/economic-optimizer-app/screenshots)

[chart-maker.js](https://github.com/thujone/code-samples/blob/main/xendee/economic-optimizer-app/client/chart-maker.js)

[number-formatter.js](https://github.com/thujone/code-samples/blob/main/xendee/economic-optimizer-app/client/number-formatter.js)

[validator.js](https://github.com/thujone/code-samples/blob/main/xendee/economic-optimizer-app/client/validator.js)

[unit-converter.js](https://github.com/thujone/code-samples/blob/main/xendee/economic-optimizer-app/client/unit-converter.js)


This application, the main part of the Xendee platform, optimizes microgrid projects from a financial standpoint. The end result is a financial report showing data visualization of things like year-over-year return on investment, maintenance costs, tax credits, and much more.

### Charting

One of the major obstacles I addressed was how we presented charts across the application. We had a wide variety of charts, literally hundreds across the platform. We had bar charts, histograms, scatter plots, plots with multiple y-axes, time-series charts, and don't forget "8760 charts," showing power consumption for every hour of a given year (8760 hours). What added to the confusion was that many of the charts were similar across the platform, but with slight differences. For example, some charts were interactive with tooltips and dropdowns. But that same chart would also be shown in PDF files, which could not be made interactive. So the code had to be altered slightly for each instance of a chart, which was very confusing to maintain. As the platform grew, developers were copying and pasting verbose chart configuration all over the place. If you wanted to make a slight edit to one chart, you'd have to make sure you made that same edit in several places. This was causing many frustrating bugs to occur.

I came up with a solution, which was to consolidate our various charting libraries (Highcharts, D3, Chart.js) into a single EcmaScript module that would greatly simplify the creation and configuration of charts. Now, back-end developers with little front-end experience could easily generate consistent, good-looking charts with a dozen lines of configuration (instead of 150 or 200 lines).

### Number Formatting, Form Validation, and Unit Conversion

No need to get too specific about these, but imagine the sort of issues we had with charting but applying to the formatting of numerical input; validating of gigantic web forms; and unit conversion between Imperial and Metric systems. In each case, I came up with high-level, reusable libraries that were powerful and flexible enough that we could use them consistently throughout the various forms (over 50) of the application. We wanted to provide consistent handling of numeric input and consistent error reporting and presentation, and these homegrown libraries were very successful at accomplishing those things.
