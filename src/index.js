const http = require("http");
var express = require("express");
const bp = require("body-parser");
var router = express();

router.use(bp.json());
router.use(bp.urlencoded({ extended: true }));
//vars
var users = [];
var token = "123456789";
var groups = [];
var myEmail = "node@test.com"

const PORT = process.env.PORT || 2700;
router.set("port", PORT);
var server = http.createServer(router);
server.listen(PORT);

//Route d'enregistrement d'un utilisateur
router.post("/subscribe", async function (req, res, next) {
  var body = req.body;
  try {
    if (!users.some((x) => x.email == body.email)) {
      users.push(body);
      res.status(200).json({
        data: {
          message: "User created",
        },
      });
    } else {
      res.status(409).json({
        error: {
          message: "User already exists",
        },
      });
    }
  } catch (ex) {
    console.log(ex);
    res.status(500).json({
      message: ex.message,
    });
  }
});

//Route de login d'un utlisateur enregistré
router.post("/login", async function (req, res, next) {
  var body = req.body;
  try {
    if (
      users.some((x) => x.email == body.email && x.password == body.password)
    ) {
      for (var i = 0; i < users.length; i++) {
        if (
          users[i].email == body.email &&
          users[i].password == body.password
        ) {
          users[i].auth = token;
        }
      }
      res.status(200).json({
        data: {
          message: "User logged in",
          authJWT: token,
        },
      });
    } else {
      res.status(401).json({
        error: {
          message: "Wrong credentials",
        },
      });
    }
  } catch (ex) {
    console.log(ex);
    res.status(500).json({
      message: ex.message,
    });
  }
});
/*ajouter les routes pour les tests ici*/

//Retour des utilisateurs sauf celui qui fait la requête
router.get("/users", async function (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "No credentials sent!" });
  } else {
    otherUsers = users.filter(user => user.email !== myEmail)
    res.status(200).json({
      data: {
        users: otherUsers,
      }
    })
  }
});

router.get("/groups", async function (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "No credentials sent!" });
  } else {
    res.status(200).json({
      data: {
        groups: groups,
      }
    })
  }
});

router.post("/groups", async function (req, res, next) {
  var body = req.body;
  body.users = users.filter(user => user.email === myEmail)
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "No credentials sent!" });
    } else if (!groups.some((x) => x.name == body.name)) {
      groups.push(body);
      res.status(200).json({
        data: {
          groups: groups,
          message: "Group created",
        },
      });
    } else {
      res.status(409).json({
        error: {
          message: "Group already exists",
        },
      });
    }
  } catch (ex) {
    console.log(ex);
    res.status(500).json({
      message: ex.message,
    });
  }
});

router.post("/groups/:groupId/invite", async function (req, res, next) {
  var body = req.body;
  var groupId = req.params.groupId
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "No credentials sent!" });
  } else {
    invitedUser = users.find(user => user.email === body.email)
    
    groups[groupId - 1].users.push(invitedUser);
    res.status(200).json({
      data: {
        groups: groups
      }
    })
  }
});

module.exports = router;
