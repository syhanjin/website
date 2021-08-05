# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request,jsonify,session,redirect,abort
import pymongo,random,datetime
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
blogdb = client['blog']
noveldb = client['novel']
blog = Blueprint('blog', __name__)
blogm = Blueprint('blogm', __name__)
def getuser(_uid):
    if _uid and not _uid == session.get('_uid'):
        return None
    return _uid
@blog.route('/')
def blog_main():
    s_index=open('templates/blog/pc/index.html','r',encoding='UTF-8').read()
    s_macro=open('templates/blog/pc/macro.html','r',encoding='UTF-8').read()
    return render_template('blog/pc/main.html',code_theme='vs2015',theme='typora-nord-theme-master/nord',
                source_index=s_index,
                source_main='''
{% extends "blog/pc/index.html" %}

{% block title %}blog{% endblock %}

{% block markcss %}

{% endblock %}

{% block blog_body %}
{% import 'blog/pc/macro.html' as func with context %}
{{ func.blog_body(
    title='关于SYBlog',
    time='2021-08-1 08:00:00',
    blogger='Sakuyark',
    content=\'\'\'
> 防止套娃，不写了
\'\'\'
) }}
{% endblock %}
''',
                source_macro=s_macro
            )
@blogm.route('/')
def blog_m_():
    s_index=open('templates/blog/pc/index.html','r',encoding='UTF-8').read()
    s_macro=open('templates/blog/pc/macro.html','r',encoding='UTF-8').read()
    return render_template('blog/m/main.html',code_theme='vs2015',theme='typora-nord-theme-master/nord',
                source_index=s_index,
                source_main='''
{% extends "blog/pc/index.html" %}

{% block title %}blog{% endblock %}

{% block markcss %}

{% endblock %}

{% block blog_body %}
{% import 'blog/pc/macro.html' as func with context %}
{{ func.blog_body(
    title='关于SYBlog',
    time='2021-08-1 08:00:00',
    blogger='Sakuyark',
    content=\'\'\'
> 防止套娃，不写了
\'\'\'
) }}
{% endblock %}
''',
                source_macro=s_macro
            )