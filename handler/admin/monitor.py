# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, jsonify, session, redirect, send_file, abort
import pymongo, random, datetime, os, shutil
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
monitor = Blueprint('monitor', __name__)
def getuser(_uid):
    if _uid and not _uid == session.get('_uid'):
        return None
    return _uid

