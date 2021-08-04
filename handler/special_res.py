# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request,jsonify,session,redirect,make_response
from user_agents import parse

sr = Blueprint('sr', __name__)

@sr.route('/netcard')
def res_netcard():
    print(request.user_agent)
    user_agent = parse(str(request.user_agent))
    bw = user_agent.browser
    s = user_agent.os
    juge_pc = user_agent.is_pc
    phone = user_agent.device
    print(bw,s,juge_pc,phone,sep='\n')
    return ''