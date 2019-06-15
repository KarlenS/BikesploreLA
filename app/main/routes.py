from flask import session, redirect, url_for, render_template, request, Response
from flask_socketio import emit
from . import main
import subprocess
from .forms import LoginForm

import matplotlib.pyplot as plt
import geopandas as gs
import json
import requests
import mplleaflet

@main.route('/', methods=['GET', 'POST'])
def bikesplorela():
    """Main page"""
    form = LoginForm()
    if form.validate_on_submit():

        session['pointA'] = form.pointA.data

        session['pointB'] = form.pointB.data

        geo_df = gs.read_file('app/static/collisions.geojson')

        locs = {'Loc1':[-118.336389,34.100833],
                'Loc2':[-118.356,34.0628],
                'Loc3':[-118.3208331,34.0837995]}


        Loc1 = form.pointA.data
        Loc2 = form.pointB.data

        x1,y1 = locs[form.pointA.data]
        x2,y2 = locs[form.pointB.data]

        reqtxt = 'http://router.project-osrm.org/route/v1/driving/{x1},{y1};{x2},{y2}?overview=simplified&exclude=motorway&annotations=true&geometries=geojson'.format(x1=x1,y1=y1,x2=x2,y2=y2)

        rout = requests.get(reqtxt)
        route = json.loads(rout.text)

        coords = route['routes'][0]['geometry']['coordinates']
        xs_route = [ c[0] for c in coords ]
        ys_route = [ c[1] for c in coords ]

        map_file = 'app/static/map_{loc1}_{loc2}.html'.format(loc1=Loc1,loc2=Loc2)

        map_file2 = 'static/map_{loc1}_{loc2}.html'.format(loc1=Loc1,loc2=Loc2)



        f, ax = plt.subplots(1)

        geo_df.geometry.plot(alpha=0.9, edgecolor='red',ax=ax) #plot dangergrid
        ax.plot(xs_route,ys_route,color='blue',linewidth=4,alpha=0.5)

        mplleaflet.save_html(fig=f, crs=geo_df.crs,fileobj=map_file)

        #fname = str(tmp.communicate()[0].strip(b'\n'),'utf-8')

    elif request.method == 'GET':
        form.pointA.data = session.get('pointA', '')
        form.pointB.data = session.get('pointB','')
        map_file2 = 'static/map.html'

    return render_template('bikesplorela.html', form=form, map_file=map_file2)
