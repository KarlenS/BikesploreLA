from flask import session, redirect, url_for, render_template, request, Response
#from flask_socketio import emit
from . import main
import subprocess
#from .forms import LoginForm

@main.route('/', methods=['GET', 'POST'])
def bikesplorela():
    """Main page"""
    return render_template('bikesplorela.html')
