# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request,jsonify,session,redirect

EL = Blueprint('EL', __name__)
@EL.route('/tools/EL')
def EL_home():
  return render_template('tools/EL/pc/main.html')
