import { Publication, User } from "../models";

export const getMainThemesAndTypesByUser = async () => {
    const users = await User.find();
    
    for (const user of users) {
        const publications = await Publication.find({ user: user._id });
        
        // Aggregate themes
        const themeCount = {};
        publications.forEach(pub => {
            pub.themes.forEach(theme => {
                themeCount[theme] = (themeCount[theme] || 0) + 1;
            });
        });
        
        // Aggregate types
        const typeCount = {};
        publications.forEach(pub => {
            typeCount[pub.type] = (typeCount[pub.type] || 0) + 1;
        });
        
        // Sort and get main themes/types
        const mainThemes = Object.entries(themeCount)
            .sort(([,a], [,b]) => b - a)
            .map(([theme]) => theme);
            
        const mainTypes = Object.entries(typeCount)
            .sort(([,a], [,b]) => b - a)
            .map(([type]) => type);
            
        console.log(`User ${user.id}:`);
        console.log('Main themes:', mainThemes);
        console.log('Main types:', mainTypes);
        console.log('-------------------');
    }
}