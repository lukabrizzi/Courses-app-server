const Menu = require('../models/menu');

function addMenu(req, res) {
    const { title, url, order, active } = req.body;
    const menu = new Menu();
    menu.title = title;
    menu.url = url;
    menu.order = order;
    menu.active = active;

    menu.save((err, createdMenu) => {
        if (err) {
            res.status(500).send({ message: 'Error del servidor.' })
        } else {
            if (!createdMenu) {
                res.status(404).send({ message: 'Error al crear el menú.' })
            } else {
                res.status(200).send({ message: "Menú creado correctamente." })
            }
        }
    });
}

function getMenu(req, res) {
    Menu.find().sort({ order: "asc" }).exec((err, menusStored) => {
        if (err) {
            res.status(500).send({ message: 'Error del servidor.' })
        } else {
            if (!menusStored) {
                res.status(404).send({ message: 'No se encontro ningun menú.' })
            } else {
                res.status(200).send({ menu: menusStored })
            }
        }
    })
}

module.exports = {
    addMenu,
    getMenu
}