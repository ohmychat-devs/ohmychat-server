import { app, supabase } from "@ohmychat/ohmychat-backend-core";
import express from "express";
import path from "path";

const __dirname = path.dirname(import.meta.url);
const distPath = path.resolve("./dist");
const indexHtml = path.resolve("./dist/index.html");

app.use(express.static(path.resolve(__dirname, "dist")));

// Sert les fichiers statiques de dist/
app.use(express.static(distPath));

// Toutes les routes retournent index.html (SPA)
const { data: apps, error } = await supabase
    .from("apps")
    .select("*")
    .eq("active", true);

if (apps) {
    apps.forEach(appData => {
        app.get(`/${appData.name}`, (req, res) => {
            res.sendFile(indexHtml);
        });
    });
}

const routes = [
    "/",
    "/home",
    "/stories/:storySection/:storyId",
];

routes.forEach(route => {
    app.get(route, (req, res) => {
        res.sendFile(indexHtml);
    });
});

console.log("Available routes:");
app._router.stack.forEach((r) => {
    if (r.route) {
        console.log(r.route.path);
    }
});

app.all('*', (req, res) => {
    res.redirect('/home');
});