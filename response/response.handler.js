module.exports.response = (req, err, data, res) => {
    if (err && err.status && err.message) {
        res.status(err.status);
        res.send(err.message);
    } else {
        res.json({ success: true, data: data });
    }
}