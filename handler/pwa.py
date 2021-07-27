# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request,jsonify,session,redirect

pwa = Blueprint('pwa', __name__)
@pwa.route('/')
def pwa_home():
  return render_template('pwa/pc/main.html')
