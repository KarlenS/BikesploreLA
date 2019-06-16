#from flask import session
from flask_socketio import emit#, join_room, leave_room
from .. import socketio

@socketio.on('gotroute')
def gotroute(message):
    """Sent by a client when a route is fetched"""
    print(message)
    #room = session.get('date')
    #sendBar = message['bar']
    emit('newroute', {'msg': message})
