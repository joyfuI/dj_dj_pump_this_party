import os

from dotenv import load_dotenv
from flask import Flask

from controllers import api, dev, home

load_dotenv(verbose=True)

app = Flask(__name__)
app.register_blueprint(home.blueprint)
app.register_blueprint(api.blueprint)
app.register_blueprint(dev.blueprint)

if __name__ == "__main__":
    FLASK_RUN_PORT = os.getenv("FLASK_RUN_PORT", "5000")
    app.run("0.0.0.0", port=int(FLASK_RUN_PORT), debug=True)
