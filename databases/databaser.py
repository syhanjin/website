# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, jsonify, session, redirect
import pymongo,datetime
from datetime import timedelta
# from tools import userhelper
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
userdb.userdata.insert_one({'user':'system'})