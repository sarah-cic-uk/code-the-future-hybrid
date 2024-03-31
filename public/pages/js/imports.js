var srcs=[
   "https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js",
   "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics-compat.js",
   "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth-compat.js",
   "https://www.gstatic.com/firebasejs/10.10.0/firebase-database-compat.js",
   "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage-compat.js"
]
for(var i=0;i<srcs.length;i++){
  var script=document.createElement("script")
  script.src=srcs[i]
  script.defer=true
  document.head.appendChild(script)
}