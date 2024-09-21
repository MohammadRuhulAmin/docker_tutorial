#!/bin/bash

case_orders=$(cat ./case_orders/process.txt)
case_proposal_comments=$(cat ./case_proposal_comments/process.txt)
case_proposals=$(cat ./case_proposals/process.txt)
khotian_comments=$(cat ./khotian_comments/process.txt)
echo "---------------------"
echo "case_orders status : $case_orders"
echo "case_proposal_comments : $case_proposal_comments"
echo "case_proposals : $case_proposals"
echo "khotian_comments : $khotian_comments"
echo "--------------------"