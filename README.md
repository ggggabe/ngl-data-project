# NGL Data Project

## Setup

1. Clone the repository
2. Use `nvm install` to install and use the correct version of Node
3. Run `npm install`
4. Run `npm run dev`

## Data Processing

1. Run `npm run process-rates` to process the rates data
2. Run `npm run analyze-data` to analyze the data

This process the raw files (./data/raw/rates, ./data/raw/attributes) into MongoDB.

## Database

1. Run `npx prisma migrate dev`
2. Run `npx prisma generate`
3. Run `npx prisma db push`

## Next Steps

1. Add models to the database
2. Add data to the database
3. Query the database
4. Add the data to the frontend

## Notes

- We're using a live MongoDB Atlas for the database
- We're using Next.js for the frontend
- We're using Prisma for the database client

## Questions

- How do we want to structure the data?
- How do we want to query the data?
- How do we want to display the data?
