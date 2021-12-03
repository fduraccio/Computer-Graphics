

function CheckCollision(one , two, weight) // AABB - AABB collision
{
   if (weight==-1){
	   return two < one
   }
   else {
	   return two >one
   } 
}  

