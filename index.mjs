import express from 'express';
import fetch from 'node-fetch';
import shuffle from 'shuffle-array';
import { createClient } from 'pexels';
import quotes from 'quotesy';

const app = express();
const client = createClient('PFlSUbcxGk4LCvLJ5cPBTD4spLttWwMk4iLK8leddmAG3OjX5fUbKgar');
app.set("view engine", "ejs"); //templating engine reuiqred
app.use(express.static("public")); //folder for static file

function randomQuote () {
    const q = quotes.random_by_tag("creativity")
    console.log(`${q.text} — ${q.author}`);
    return q;
}

//1 home page route
app.get('/', async (req, res) => { 
    const quote = randomQuote();
    console.log(quote);
    try {
        let query = "CGI";
        let response = await client.photos.search({ page: 1, query, per_page: 40, size: "large" });
        let photos = response.photos.map(photo => ({
            url: photo.src.large2x,
            page: photo.url,
            photographer: photo.photographer
        }));

        res.render('index', {activeLink: 'index', homeImages: shuffle(photos), randQuote: quote});
    } catch(error){
        console.error(error);
        res.status(500).send("Error fetching images from source.");
    }
});

//2 foundation route
app.get('/foundations', async (req, res) => {
    const quote = randomQuote();
    console.log(quote);
    let apiKey = "53393422-15fcc4197b5a5b35dae9f2db9";
    try {
        let url = `https://pixabay.com/api/?per_page=60&orientation=horizontal&q="computer+graphics"&safesearch="true"&key=${apiKey}`;
        let response = await fetch(url);
        let data = await response.json();
        let arrayImages = shuffle(data.hits);

        console.log(data);
        res.render('foundations', {activeLink: 'foundations', foundationImages: arrayImages, randQuote: quote}); 
    } catch(error){
        console.error(error);
        res.status(500).send("Error fetching images from source");
    }
}); 

//3 application route
app.get('/applications', (req, res) => { 
    const quote = randomQuote();
    console.log(quote);
    res.render('applications', {activeLink: 'applications', randQuote: quote}); 
}); 

//4 future technology route
app.get('/futuretechnology', (req, res) => { 
    const quote = randomQuote();
    console.log(quote);
    res.render('futuretechnology', {activeLink: 'future', randQuote: quote}); 
}); 

//5 explore route
app.get('/explore', async (req, res) => {
    const quote = randomQuote();
    console.log(quote);
    let query = "computer graphics";
    let limit = "20";
    try {
        //Semantic Scholar API fetch for computer graphic related articles
        let articleURL = `https://api.semanticscholar.org/graph/v1/paper/search?query=computer+graphics&fields=title,abstract,year,url,openAccessPdf&limit=60`;
        let articleResponse = await fetch(articleURL, {
            headers: {
                'x-api-key': "VoztPyTAQs2awrMLc5vJo2frG2YZ0BCo7JKevMJA",
            },
        });

        //semantic scholar mentions to check error in the documentaion
        if (!articleResponse.ok) {
            throw new Error(`Semantic Scholar API error: ${articleResponse.status}`);
        }

        let articleData = await articleResponse.json();
        let papers = articleData.data.map(scholar => ({
            title: scholar.title,
            abstract: scholar.abstract,
            year: scholar.year,
            url: scholar.url,
            pdf: scholar.openAccessPdf ? scholar.openAccessPdf.url : null,
        }));

        //Reddit public api fetch for computer graphics related subreddits
        let redURL = `https://www.reddit.com/subreddits/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
        let redResp = await fetch(redURL);
        let redJSON = await redResp.json();
        let newArray = redJSON.data.children.map(redData => ({
            title: redData.data.title,
            displayName: redData.data.display_name_prefixed,
            subscribers: redData.data.subscribers,
            url: `https://reddit.com${redData.data.url}`,
            desc: redData.data.description
        }));

        console.log(newArray);
        console.log(papers);
        res.render('explore', {activeLink: 'explore', randQuote: quote,
                                p: shuffle(papers).slice(0,8), subreddits: newArray});
    } catch(error){
        console.error(error);
        res.status(500).send("Error fetching images from source");
    }
}); 

app.listen(3000, () => {
    console.log('server started');
});