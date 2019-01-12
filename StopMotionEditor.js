// A stop-motion creation program.
//Created in 2018 for Pantalla Cambie.

function StopMotionEditor(parentElement, frames)
{
	this.video = document.createElement("video");
	this.element = document.createElement("div");
        this.controls = document.createElement("div");
	this.previewCanvas = document.createElement("canvas");
        this.videoDisplayCanvas = document.createElement("canvas");
	this.hiddenCanvas = document.createElement("canvas");

	this.previewCanvas.width = 400;
	this.previewCanvas.height = 400;
	this.previewCtx = this.previewCanvas.getContext("2d");

        this.videoDisplayCanvas.width = this.previewCanvas.width;
        this.videoDisplayCanvas.height = this.previewCanvas.height;

	this.videoDisplayCtx = this.videoDisplayCanvas.getContext("2d");
	this.hiddenCtx = this.hiddenCanvas.getContext("2d");

	this.frames = frames || [];

	this.framesPerSecond = 10;
	this.currentFrame = 0;	

	this.playingVideo = false;
	this.recording = false;

	this.stopPreviewLoop = false;

	var me = this;
	me.load = function()
	{
		me.loadControls();

		me.camera = navigator.mediaDevices.getUserMedia({ video: { "facingMode": "environment" } });

		me.video.onloadedmetadata = function()
		{
			if(me.video.videoHeight < me.video.videoWidth)
			{
				me.hiddenCanvas.width = me.previewCanvas.width;
				me.hiddenCanvas.height = me.video.videoHeight * me.previewCanvas.width / me.video.videoWidth;
			}
			else
			{
				me.hiddenCanvas.height = me.video.videoWidth * me.previewCanvas.width / me.video.videoHeight;
				me.hiddenCanvas.width = me.previewCanvas.width;
			}

			me.previewLoop();
		};

		me.camera.then(function(media)
		{
			me.video.srcObject = media;
			me.video.play();

			if(window.webkitURL)
			{
				me.video.src = window.webkitURL.createObjectURL(media);
			}
			else
			{
				me.video.src = media;
			}

			me.video.play();
		});
	};

        this.loadControls = function()
	{
		var mainSegement = HTMLHelper.commandMapToButtons(
		{
			"Empiece": function()
			{
				if(this.innerHTML === "Empiece")
				{
					me.playingVideo = true;
					this.innerHTML = "Termine";
				}
				else
				{
					me.playingVideo = false;
					this.innerHTML = "Empiece";
				}
			},
			"Tome una Foto": function()
			{
				me.takePicture();
			},
			"Empiece recordando fotos.": function()
			{
				if(this.innerHTML === "Empiece recordando fotos.")
				{
					me.recording = true;
					this.innerHTML = "Termine recordando fotos.";
				}
				else
				{
					me.recording = false;
					this.innerHTML = "Empiece recordando fotos.";
				}
			},
			"Invierta": function()
			{
				var temp;
				for(var index = 0; index < Math.floor(me.frames.length / 2); index++)
				{
					temp = me.frames[me.frames.length - index - 1];
					me.frames[me.frames.length - index - 1] = me.frames[index];
					me.frames[index] = temp;
				}
			},
			"Edite sus Fotos": function()
			{
				var editWindow = SubWindowHelper.create({ title: "Edite Las Fotos", width: "40%", height: "55%" });
                                var contentElement = editWindow.getContent();
				contentElement.style.overflowX = "hidden";
				contentElement.style.paddingBottom = "10px";
				
				HTMLHelper.addLabel("El número de la foto", contentElement);
				var frameInput = HTMLHelper.addInput("", "0", contentElement, "number");
				var frameInputRange = HTMLHelper.addInput("", "0", contentElement, "range");
				frameInputRange.min = 0;
				frameInputRange.max = 100;
				frameInputRange.step = 0.01;

				HTMLHelper.addHR(contentElement);

				var editorParent = document.createElement("div");

				var offScreenCanvas = document.createElement("canvas");

				var editorCanvas = document.createElement("canvas");
				editorCanvas.width = me.hiddenCanvas.width;
				editorCanvas.height = me.hiddenCanvas.height;
				offScreenCanvas.width = editorCanvas.width;
				offScreenCanvas.height = editorCanvas.height;

				var editorCtx = editorCanvas.getContext("2d");
				var offScreenCtx = offScreenCanvas.getContext("2d");
				offScreenCtx.lineCap = "round";
				offScreenCtx.lineJoin = "round";

				editorCanvas.style.width = "100%";
				editorCanvas.style.height = "auto";

				var lineWidth = 1;
				var minLineWidth = 0.1, maxLineWidth = 100;
				offScreenCtx.lineWidth = lineWidth;

				contentElement.appendChild(editorParent);
				editorParent.appendChild(editorCanvas);

				var updateTextInputValue = function()
				{
					frameInput.value = Math.floor(frameInputRange.value * me.frames.length / 100);
				};

				var updateRangeInputValue = function()
				{
					frameInputRange.value = MathHelper.forceParseInt(frameInput.value) / me.frames.length * 100;
				};
				
				var frameIndex = 0;
				var tX = 0, tY = 0, zoom = 1;
				var updateEditorView = function()
				{
					editorCtx.clearRect(0, 0, editorCtx.canvas.width, editorCtx.canvas.height);
					editorCtx.save();
					editorCtx.translate(tX, tY);
					editorCtx.scale(zoom, zoom);
					editorCtx.drawImage(offScreenCtx.canvas, 0, 0);
					editorCtx.restore();
				};

				var displayFrame = function()
				{
					frameIndex = MathHelper.forceParseInt(frameInput.value);
					me.displayCurrentFrame(offScreenCtx, frameIndex);
					updateEditorView();
				};
				displayFrame();

				frameInput.oninput = function()
				{
					updateRangeInputValue();

					displayFrame();
				};

				frameInputRange.oninput = function()
				{
					updateTextInputValue();
					updateRangeInputValue();

					displayFrame();
				};

				var nextPhoto = function()
				{
					frameIndex++;
					frameInput.value = frameIndex + "";
					updateRangeInputValue();
					displayFrame();
				};

				var previousPhoto = function()
				{
					frameIndex++;
					frameInput.value = frameIndex + "";
					updateRangeInputValue();
					displayFrame();
				};

				var drawingColor = "rgba(255, 255, 255, 0.9)";

				var lastTime = (new Date()).getTime();
				var commandArea = HTMLHelper.commandMapToButtons(
				{
					"Borrela": function()
					{
						var nowTime = (new Date()).getTime();

						if(nowTime - lastTime > 2500)
						{
							SubWindowHelper.confirm("¿Está seguro?", "¿Quiere borrar esta foto?", function(si)
							{
								if(si)
								{
									me.frames.splice(frameInput.value * 1, 1);
									displayFrame();
								}
							}, {}, "Sí", "No");
						}
						else
						{
							me.frames.splice(frameInput.value * 1, 1);
							displayFrame();
						}
						
						lastTime = nowTime;
					},
					"Seleccione el color de la lapíz": function()
					{
						var button = this;
						var oldRGBAArray = HTMLHelper.colorStringToArray(drawingColor);
						
						SubWindowHelper.promptForColor("Cambie el Color", "Seleccione el color.", oldRGBAArray,
						function(red, green, blue, alpha)
						{
							drawingColor = "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";
							button.style.backgroundColor = drawingColor;
						});
					},
					"Seleccione el ancho de la lapíz": function()
					{
						SubWindowHelper.prompt("Seleccione el Ancho", "Seleccione el ancho de la lapíz.", "", 
						function(value)
						{
							value *= value;
							value *= maxLineWidth;
							value += minLineWidth;
							lineWidth = value;
							offScreenCtx.lineWidth = lineWidth;
						}, "range", {}, { min: 0, max: 1, step: 0.1, value: Math.sqrt((lineWidth - minLineWidth) / maxLineWidth) });
					},
					"Vaya a la próxima foto.": function()
					{
						nextPhoto();
					},
					"Cerrar todo en esta foto": function()
					{
						offScreenCtx.fillRect(0, 0, offScreenCtx.canvas.width, offScreenCtx.canvas.height);

						updateEditorView();

						saveChanges();
					},
					"Copie esta foto": function()
					{
						var image2 = new Image();
						image2.src = offScreenCanvas.toDataURL() + "";
						me.frames.splice(frameIndex, 0, image2);

						frameIndex++;
						frameInput.value = frameIndex + "";
						updateRangeInputValue();
						displayFrame();
					}
				});


				contentElement.appendChild(commandArea);

				var saveChanges = function()
				{
					var initialFrameIndex = frameIndex * 1;
					frameIndex = me.updateFrame(offScreenCanvas, frameIndex);
					
					if(initialFrameIndex !== frameIndex) // If a new frame was added,
					{
						frameInput.value = frameIndex + "";
						updateRangeInputValue();
					}
				};

				var pointerDown = false;
				var lastX = 0, lastY = 0;
				var handlePointerDown = function(x, y)
				{
					lastX = x;
					lastY = y;

					pointerDown = true;
				};

				var handlePointerMove = function(x, y)
				{
					if(pointerDown)
					{
						offScreenCtx.strokeStyle = drawingColor;
						offScreenCtx.beginPath();
						offScreenCtx.moveTo(x, y);
						offScreenCtx.lineTo(lastX, lastY);
						offScreenCtx.stroke();

						updateEditorView();

						lastX = x;
						lastY = y;
					}
				};

				var handlePointerUp = function()
				{
					pointerDown = false;

					saveChanges();
				};

				var eventToCanvas = function(e, normalize)
				{
					var bbox = editorCanvas.getBoundingClientRect();
					var x = e.clientX - bbox.left;// + contentElement.scrollLeft;
					var y = e.clientY - bbox.top;// + contentElement.scrollTop;

					x /= editorCanvas.clientWidth;
					y /= editorCanvas.clientHeight;

					if(normalize !== false)
					{
						x *= offScreenCtx.canvas.width;
						y *= offScreenCtx.canvas.height;
	
						x /= zoom;
						y /= zoom;

						x -= tX;
						y -= tY;
					}

					return {"x": x, "y": y};
				};

				editorCanvas.onmousedown = function(e)
				{
					var point = eventToCanvas(e);

					handlePointerDown(point.x, point.y);					
				};

				editorCanvas.onmouseleave = function(e)
				{
					handlePointerUp();
				};

				editorCanvas.onmouseup = function(e)
				{
					handlePointerUp();
				};

				editorCanvas.onmousemove = function(e)
				{
					var coord = eventToCanvas(e);

					handlePointerMove(coord.x, coord.y);
				};

				editorCanvas.onclick = function(e)
				{
					var coord = eventToCanvas(e);
					pointerDown = true;
					handlePointerMove(coord.x, coord.y);
					pointerDown = false;
				};

				var touchElement = editorCanvas.parentElement, lastDistance = 0;
				var zooming = false;

				touchElement.onkeypress = function(e)
				{
					if(e.key === "+" || e.key === "a")
					{
						zoom += 0.01;
					}

					if(e.key === "-" || e.key === "s")
					{
						zoom -= 0.01;
					}

					if(e.key === "l")
					{
						tX -= 10;
					}


					if(e.key === "j")
					{
						tX += 10;
					}

					if(e.key === "w" || e.key === "k")
					{
						tY -= 10;
					}

					if(e.key === "q" || e.key === "i")
					{
						tY += 10;
					}

					updateEditorView();
				};

				touchElement.setAttribute("tabIndex", "12");

				touchElement.addEventListener("touchstart", function(e)
				{
					e.preventDefault();
					pointerDown = true;

					if(e.changedTouches.length === 1)
					{
						try
						{
							var touch = e.changedTouches[0];
							var point = eventToCanvas(touch);
							handlePointerDown(point.x, point.y);
						}
						catch(e)
						{
							console.warn(e);
						}
						zooming = false;
					}
					else if(e.changedTouches.length > 1)
					{
						zooming = true;
						var touch1 = e.changedTouches[0];
						var point1 = eventToCanvas(touch1, false);

						var touch2 = e.changedTouches[1];
						var point2 = eventToCanvas(touch2, false);
						
						lastDistance = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
					}
				}, true);

				touchElement.addEventListener("touchmove", function(e)
				{
					e.preventDefault();

					if(e.changedTouches.length === 1 && !zooming)
					{
						var touch = e.changedTouches[0];
						var point = eventToCanvas(touch);
						handlePointerMove(point.x, point.y);
					}
					else if(e.changedTouches.length > 1)
					{
						zooming = true;
						var touch1 = e.changedTouches[0];
						var point1 = eventToCanvas(touch1, false);

						var touch2 = e.changedTouches[1];
						var point2 = eventToCanvas(touch2, false);

						point1.x /= offScreenCanvas.width;
						point1.y /= offScreenCanvas.height;

						point2.x /= offScreenCanvas.width;
						point2.y /= offScreenCanvas.height;

						/*if(point1.x >= 0.5)
						{
							tX += offScreenCanvas.width / 300;
						}
						else
						{
							tY -= offScreenCanvas.width / 300;
						}
						
						if(point1.y >= 0.5)
						{
							tY += offScreenCanvas.height / 300;
						}
						else
						{
							tY -= offScreenCanvas.width / 300;
						}*/

						

						var currentDistance = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));

						if(lastDistance !== undefined)
						{
							zoom += (currentDistance - lastDistance) * offScreenCanvas.width * 2;

							if(zoom < 0.5)
							{
								zoom = 0.5;
							}
							else if(zoom > 5)
							{
								zoom = 5;
							}
						}

						lastDistance = currentDistance;
					}
				}, true);


				touchElement.addEventListener("touchend", function(e)
				{
					e.preventDefault();

					var touch = e.changedTouches[0];
					var point = eventToCanvas(touch);
					handlePointerUp(point.x, point.y);

					lastDistance = undefined;
					zooming = false;

				}, true);

				touchElement.style.touchAction = "none";

				displayFrame();
			}
		});

		me.progressBar = document.createElement("input");
		me.progressBar.style.width = "100%";
		me.progressBar.type = "range";

		me.progressBar.min = 0;
		me.progressBar.max = 100;
		me.progressBar.step = 1;
		me.progressBar.value = 0;

		me.progressBar.oninput = function()
		{
			me.currentFrame = me.progressBar.value / 100.0 * me.frames.length;
		};

		me.controls.appendChild(mainSegement);
		me.controls.appendChild(me.progressBar);
                
		me.fpsLabel = HTMLHelper.addLabel("El número de partes por segundo.", me.controls);
		me.fpsInput = HTMLHelper.addInput("", me.framesPerSecond, me.controls, "number");

		me.fpsInput.oninput = function()
		{
			me.framesPerSecond = MathHelper.forceParseFloat(me.fpsInput.value);
		};
	};

	this.takePicture = function()
	{
		me.hiddenCtx.drawImage(me.video, 0, 0, me.hiddenCtx.canvas.width, me.hiddenCtx.canvas.height);

		var newFrame = new Image();
		newFrame.src = me.hiddenCtx.canvas.toDataURL();
		
		me.frames.push(newFrame);
	};

	this.updateFrame = function(canvas, frameIndex)
	{
		if(frameIndex < me.frames.length)
		{
			me.frames[frameIndex].src = canvas.toDataURL();

			return frameIndex;
		}
		else
		{
			var image = new Image();
			image.src = canvas.toDataURL();

			me.frames.push(image);

			return me.frames.length - 1;
		}
	};

	this.displayCurrentFrame = function(ctx, frameIndex)
	{
		var currentIndex = frameIndex || Math.floor(me.currentFrame);
		
		if(currentIndex < me.frames.length)
		{
			var image = me.frames[currentIndex];

			try
			{
				ctx.drawImage(image, 0, 0, me.hiddenCanvas.width, me.hiddenCanvas.height);
			}
			catch(e)
			{
				console.warn(e);
				window.errorImage = image;
				window.frames = me.frames;
				console.log("INDEX: " + currentIndex);
			}
		}
		else
		{
			ctx.fillRect(0, 0, me.hiddenCanvas.width, me.hiddenCanvas.height);
		}
	};

	var lastTime = (new Date()).getTime();
	var lastTime2 = lastTime;
	this.previewLoop = function()
	{
		me.previewCtx.drawImage(me.video, 0, 0, me.hiddenCanvas.width, me.hiddenCanvas.height);

		var nowTime = (new Date()).getTime();

		if (me.playingVideo)
		{

			if((nowTime - lastTime) * me.framesPerSecond / 1000 >= 1)
			{
				me.currentFrame += (nowTime - lastTime) * me.framesPerSecond / 1000;
				if(me.currentFrame > me.frames.length)
				{
					me.currentFrame = 0;
				}

				me.displayCurrentFrame(me.videoDisplayCtx);

				me.progressBar.value = Math.floor(me.currentFrame / me.frames.length * 100);
				
				lastTime = nowTime;
			}
		}
		else
		{
			lastTime = (new Date()).getTime();
		}

		if(me.recording && (nowTime - lastTime2) * me.framesPerSecond / 1000 >= 1)
		{
			me.takePicture();
			lastTime2 = nowTime;
		}
	
		if(!me.stopPreviewLoop)
		{
			requestAnimationFrame(me.previewLoop);
		}
	};

	this.quit = function()
	{
		me.stopPreviewLoop = true;
                me.video.pause();
	};

	me.element.appendChild(me.controls);
	me.element.appendChild(me.previewCanvas);
	me.element.appendChild(me.videoDisplayCanvas);
	parentElement.appendChild(me.element);
}
