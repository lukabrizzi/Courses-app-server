const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");
const User = require("../models/user");

function signUp(req, res) {
    const user = new User();

    const { name, lastname, email, password, verifPassword } = req.body;

    user.name = name;
    user.lastname = lastname;
    user.email = email.toLowerCase();
    user.role = "admin";
    user.active = false;


    if (!password || !verifPassword) {
        res.status(404).send({ message: "Debe completar las dos contraseñas." });
    } else {
        if (password !== verifPassword) {
            res.status(404).send({ message: "Las contraseñas deben ser iguales." });
        } else {
            bcrypt.hash(password, null, null, function (err, hash) {
                if (err) {
                    res.status(500).send({ message: "Error al encriptar la contraseña." })
                } else {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if (err) {
                            res.status(500).send({ message: "El usuario ya existe." });
                        } else {
                            if (!userStored) {
                                res.status(404).send({ message: "Error al crear el usuario." });
                            } else {
                                res.status(200).send({ user: userStored });
                            }
                        }
                    });
                }
            })
        }
    }
}

function signIn(req, res) {
    const params = req.body;
    const email = params.email.toLowerCase();
    const password = params.password;

    User.findOne({ email }, (err, userStored) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor" })
        }

        if (!userStored) {
            res.status(404).send({ message: "Usuario no encontrado" })
        } else {
            bcrypt.compare(password, userStored.password, (err, check) => {
                if (err) {
                    res.status(500).send({ message: "Error del servidor" })
                } else if (!check) {
                    res.status(500).send({ message: "La contraseña es incorrecta" })
                } else {
                    if (!userStored.active) {
                        res.status(200).send({ code: 200, message: "El usuario no se ha activado" })
                    } else {
                        res.status(200).send({
                            accessToken: jwt.createAccessToken(userStored),
                            refreshToken: jwt.createRefreshToken(userStored)
                        })
                    }
                }
            })
        }
    })
}

function getUsers(req, res) {
    User.find().then(users => {
        if (!users) {
            res.status(404).send({ message: "No se ha encontrado ningun usuario." })
        } else {
            res.status(200).send({ users });
        }
    })
}

function getUsersActive(req, res) {
    const query = req.query;
    User.find({ active: query.active }).then(users => {
        if (!users) {
            res.status(404).send({ message: "No se ha encontrado ningun usuario activo." })
        } else {
            res.status(200).send({ users });
        }
    })
}

function uploadAvatar(req, res) {
    const params = req.params;

    User.findById({ _id: params.id }, (err, userData) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor." })
        } else {
            if (!userData) {
                res.status(404).send({ message: "No se encontro ningun usuario." })
            } else {
                let user = userData;

                if (req.files) {
                    let filePath = req.files.avatar.path;
                    let fileSplit = filePath.split("/");
                    let fileName = fileSplit[2];

                    let extSplit = fileName.split(".");
                    let fileExt = extSplit[1];

                    if (fileExt !== "png" && fileExt !== "jpg") {
                        res.status(200).send({ message: "La extensión de la imagen no es valida. (Extensiones permitidas: .png y .jpg)" })
                    } else {
                        user.avatar = fileName;
                        User.findByIdAndUpdate({ _id: params.id }, user, (err, userResult) => {
                            if (err) {
                                res.status(500).send({ message: "Error del servidor." })
                            } else {
                                if (!userResult) {
                                    res.status(404).send({ message: "No se ha encontrado ningun usuario." });
                                } else {
                                    res.status(202).send({ avatarName: fileName });
                                }
                            }
                        })
                    }
                }
            }
        }
    })
}

function getAvatar(req, res) {
    const avatarName = req.params.avatarName;
    const filePath = `./uploads/avatar/${avatarName}`;

    fs.access(filePath, error => {
        if (!error) {
            res.sendFile(path.resolve(filePath));
        } else {
            res.status(404).send({ message: "El avatar no existe." });
        }
    });
}

function updateUser(req, res) {
    const userData = req.body;
    const params = req.params;

    User.findByIdAndUpdate({ _id: params.id }, userData, (err, userUpdate) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor." })
        } else {
            if (!userUpdate) {
                res.status(404).send({ message: "No se ha encontrado ningun usuario." })
            } else {
                res.status(200).send({ message: "Usuario modificado correctamente" })
            }
        }
    })
}

module.exports = {
    signUp,
    signIn,
    getUsers,
    getUsersActive,
    uploadAvatar,
    getAvatar,
    updateUser
}