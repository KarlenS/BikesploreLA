from flask_wtf import FlaskForm
from wtforms.fields import StringField, SubmitField, SelectField
from wtforms.validators import Required,Optional

class LoginForm(FlaskForm):
    """Accepts a TV Show title to plot ratings."""
    pointA = SelectField('Start',choices = [('Loc1','Egyptian Theater'),\
                                            ('Loc2','LACMA'),\
                                            ('Loc3','Paramount Studios Tour')], validators=[Required()])
    pointB = SelectField('End',default='Loc2',choices = [('Loc1','Egyptian Theater'),\
                                            ('Loc2','LACMA'),\
                                            ('Loc3','Paramount Studios Tour')], validators=[Required()])
    #style = SelectField('Style',choices = [('bar','bar'),('line','line')], validators = [Required()])
    submit = SubmitField('Get Directions')
