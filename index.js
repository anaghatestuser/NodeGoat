const SessionHandler = require("./session");
const ProfileHandler = require("./profile");
const BenefitsHandler = require("./benefits");
const ContributionsHandler = require("./contributions");
const AllocationsHandler = require("./allocations");
const MemosHandler = require("./memos");
const ResearchHandler = require("./research");
const tutorialRouter = require("./tutorial");
const ErrorHandler = require("./error").errorHandler;

const index = (app, db) => {

    "use strict";

    const sessionHandler = new SessionHandler(db);
    const profileHandler = new ProfileHandler(db);
    const benefitsHandler = new BenefitsHandler(db);
    const contributionsHandler = new ContributionsHandler(db);
    const allocationsHandler = new AllocationsHandler(db);
    const memosHandler = new MemosHandler(db);
    const researchHandler = new ResearchHandler(db);

    // Middleware to check if a user is logged in
    const isLoggedIn = sessionHandler.isLoggedInMiddleware;

    //Middleware to check if user has admin rights
    const isAdmin = sessionHandler.isAdminUserMiddleware;

    // The main page of the app
    app.get("/", sessionHandler.displayWelcomePage);

    // Login form
    app.get("/login", sessionHandler.displayLoginPage);
    app.post("/login", sessionHandler.handleLoginRequest);

    // Signup form
    app.get("/signup", sessionHandler.displaySignupPage);
    app.post("/signup", sessionHandler.handleSignup);

    // Logout page
    app.get("/logout", sessionHandler.displayLogoutPage);

    // The main page of the app
    app.get("/dashboard", isLoggedIn, sessionHandler.displayWelcomePage);

    // Profile page
    app.get("/profile", isLoggedIn, profileHandler.displayProfile);
    app.post("/profile", isLoggedIn, profileHandler.handleProfileUpdate);

    // Contributions Page
    app.get("/contributions", isLoggedIn, contributionsHandler.displayContributions);
    app.post("/contributions", isLoggedIn, contributionsHandler.handleContributionsUpdate);

    // Benefits Page
    app.get("/benefits", isLoggedIn, benefitsHandler.displayBenefits);
    app.post("/benefits", isLoggedIn, benefitsHandler.updateBenefits);
    /* Fix for A7 - checks user role to implement  Function Level Access Control
     app.get("/benefits", isLoggedIn, isAdmin, benefitsHandler.displayBenefits);
     app.post("/benefits", isLoggedIn, isAdmin, benefitsHandler.updateBenefits);
     */

    // Allocations Page
    app.get("/allocations/:userId", isLoggedIn, allocationsHandler.displayAllocations);

    // Memos Page
    app.get("/memos", isLoggedIn, memosHandler.displayMemos);
    app.post("/memos", isLoggedIn, memosHandler.addMemos);

    // Handle redirect for learning resources link
    app.get("/learn", isLoggedIn, (req, res) => {
        // Only allow redirects that stay on this application's own origin.
        // Reject absolute / protocol-relative / scheme URLs that point elsewhere.
        const target = req.query.url;

        // Establish this request's own origin as the resolution base.
        const base = `${req.protocol}://${req.get("host")}`;

        let resolved;
        try {
            // Resolving against `base` turns relative paths ("/foo") into
            // same-origin URLs, while absolute ("https://evil"),
            // protocol-relative ("//evil") and scheme ("javascript:") inputs
            // keep their own (foreign or opaque) origin.
            resolved = new URL(String(target), base);
        } catch (e) {
            // Missing / empty / malformed input -> safe default, no external redirect.
            return res.redirect("/dashboard");
        }

        if (resolved.origin !== base) {
            return res.redirect("/dashboard");
        }

        // Preserve only the path/query/hash of the validated same-origin URL.
        const path = resolved.pathname + resolved.search + resolved.hash;

        // A same-origin pathname can still begin with "//" (or "/\", which the
        // URL parser normalizes to "//") when the input embeds our own origin,
        // e.g. "http://<apphost>//evil.com". Emitting that as a Location header
        // yields a protocol-relative redirect that navigates off-site. Require
        // the path to be a single leading slash not followed by another
        // slash or backslash.
        if (!/^\/(?![/\\])/.test(path)) {
            return res.redirect("/dashboard");
        }

        return res.redirect(path);
    });

    // Research Page
    app.get("/research", isLoggedIn, researchHandler.displayResearch);

    // Mount tutorial router
    app.use("/tutorial", tutorialRouter);

    // Error handling middleware
    app.use(ErrorHandler);
};

module.exports = index;
