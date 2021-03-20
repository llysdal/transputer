from flask import Flask

from transputer.main import transputerapi

app = Flask(__name__)

app.register_blueprint(transputerapi)

@app.route("/")
def hello():
    return "Hello :)"

if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host="0.0.0.0", debug=True, port=80)
